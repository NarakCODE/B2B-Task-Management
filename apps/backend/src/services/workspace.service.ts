import mongoose from "mongoose"
import { Readable } from "stream"
import cloudinary from "../config/cloudinary.config"
import { Roles, Permissions } from "../enums/role.enum"
import MemberModel from "../models/member.model"
import RoleModel from "../models/roles-permission.model"
import UserModel from "../models/user.model"
import WorkspaceModel from "../models/workspace.model"
import { BadRequestException, NotFoundException } from "../utils/appError"
import TaskModel from "../models/task.model"
import { TaskStatusEnum } from "../enums/task.enum"
import ProjectModel from "../models/project.model"

//********************************
// CREATE NEW WORKSPACE
//**************** **************/
export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string
    description?: string | undefined
  },
) => {
  const { name, description } = body

  const user = await UserModel.findById(userId)

  if (!user) {
    throw new NotFoundException("User not found")
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER })

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found")
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  })

  await workspace.save()

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  })

  await member.save()

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId
  await user.save()

  return {
    workspace,
  }
}

//********************************
// GET WORKSPACES USER IS A MEMBER
//**************** **************/
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec()

  // Extract workspace details from memberships
  const workspaces = memberships.map((membership) => membership.workspaceId)

  return { workspaces }
}

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId)

  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }

  const members = await MemberModel.find({
    workspaceId,
  }).populate("role")

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  }

  return {
    workspace: workspaceWithMembers,
  }
}

//********************************
// GET ALL MEMEBERS IN WORKSPACE
//**************** **************/

export const getWorkspaceMembersService = async (workspaceId: string) => {
  // Fetch all members of the workspace

  const members = await MemberModel.find({
    workspaceId,
  })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name")

  const roles = await RoleModel.find({}, { name: 1, _id: 1 }).select("-permission").lean()

  return { members, roles }
}

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date()

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          { $count: "count" },
        ],
        tasksByStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        tasksByPriority: [
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ])

  const _analytics = taskAnalytics[0]

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
    tasksByStatus: _analytics.tasksByStatus || [],
    tasksByPriority: _analytics.tasksByPriority || [],
  }

  return { analytics }
}

export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }

  const role = await RoleModel.findById(roleId)
  if (!role) {
    throw new NotFoundException("Role not found")
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  })

  if (!member) {
    throw new Error("Member not found in the workspace")
  }

  member.role = role
  await member.save()

  return {
    member,
  }
}

//********************************
// UPDATE WORKSPACE
//**************** **************/
export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }

  // Update the workspace details
  workspace.name = name || workspace.name
  workspace.description = description || workspace.description
  await workspace.save()

  return {
    workspace,
  }
}

//********************************
// UPLOAD WORKSPACE LOGO
//**************** **************/
export const uploadWorkspaceLogoService = async (
  workspaceId: string,
  file: Express.Multer.File,
) => {
  const workspace = await WorkspaceModel.findById(workspaceId)
  if (!workspace) {
    throw new NotFoundException("Workspace not found")
  }

  // Stream buffer to Cloudinary
  const uploadResult = await new Promise<{
    secure_url: string
    public_id: string
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `workspace-logos/${workspaceId}`,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) reject(error || new Error("Upload failed"))
        else resolve(result as any)
      },
    )

    const readable = new Readable()
    readable.push(file.buffer)
    readable.push(null)
    readable.pipe(stream)
  })

  // If there's an existing logo, delete it from Cloudinary
  if (workspace.logoPublicId) {
    try {
      await cloudinary.uploader.destroy(workspace.logoPublicId, {
        resource_type: "image",
      })
    } catch (_) {
      // Best-effort deletion
    }
  }

  workspace.logo = uploadResult.secure_url
  workspace.logoPublicId = uploadResult.public_id
  await workspace.save()

  return {
    workspace,
  }
}

export const deleteWorkspaceService = async (workspaceId: string, userId: string) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const workspace = await WorkspaceModel.findById(workspaceId).session(session)
    if (!workspace) {
      throw new NotFoundException("Workspace not found")
    }

    // Check if the user owns the workspace
    if (!workspace.owner.equals(new mongoose.Types.ObjectId(userId))) {
      throw new BadRequestException("You are not authorized to delete this workspace")
    }

    const user = await UserModel.findById(userId).session(session)
    if (!user) {
      throw new NotFoundException("User not found")
    }

    await ProjectModel.deleteMany({ workspace: workspace._id }).session(session)
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session)

    await MemberModel.deleteMany({
      workspaceId: workspace._id,
    }).session(session)

    // Update the user's currentWorkspace if it matches the deleted workspace
    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(session)
      // Update the user's currentWorkspace
      user.currentWorkspace = memberWorkspace ? memberWorkspace.workspaceId : null

      await user.save({ session })
    }

    await workspace.deleteOne({ session })

    await session.commitTransaction()

    session.endSession()

    return {
      currentWorkspace: user.currentWorkspace,
    }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

export const getWorkspaceRolesService = async () => {
  const roles = await RoleModel.find({})
  return { roles }
}

export const updateRolePermissionsService = async (roleId: string, permissions: string[]) => {
  const role = await RoleModel.findById(roleId)
  if (!role) {
    throw new NotFoundException("Role not found")
  }

  // Validate that permissions are valid PermissionType values
  const validPermissions = Object.values(Permissions)
  const invalidPermissions = permissions.filter((p) => !validPermissions.includes(p as any))
  if (invalidPermissions.length > 0) {
    throw new BadRequestException(`Invalid permissions: ${invalidPermissions.join(", ")}`)
  }

  role.permissions = permissions as any
  await role.save()

  return { role }
}
