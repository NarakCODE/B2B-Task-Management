import { Request, Response } from "express"

import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import {
  changeRoleSchema,
  createWorkspaceSchema,
  workspaceIdSchema,
} from "../validation/workspace.validation"
import { HTTPSTATUS } from "../config/http.config"
import {
  changeMemberRoleService,
  createWorkspaceService,
  deleteWorkspaceService,
  getAllWorkspacesUserIsMemberService,
  getWorkspaceAnalyticsService,
  getWorkspaceByIdService,
  getWorkspaceMembersService,
  updateWorkspaceByIdService,
  uploadWorkspaceLogoService,
  getWorkspaceRolesService,
  updateRolePermissionsService,
} from "../services/workspace.service"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { z } from "zod"
import { Permissions } from "../enums/role.enum"
import { roleGuard } from "../utils/roleGuard"
import { updateWorkspaceSchema } from "../validation/workspace.validation"
import { BadRequestException } from "../utils/appError"

export const createWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
  const body = createWorkspaceSchema.parse(req.body)

  const userId = req.user?._id
  const { workspace } = await createWorkspaceService(userId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Workspace created successfully",
    workspace,
  })
})

// Controller: Get all workspaces the user is part of

export const getAllWorkspacesUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id

    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId)

    return res.status(HTTPSTATUS.OK).json({
      message: "User workspaces fetched successfully",
      workspaces,
    })
  },
)

export const getWorkspaceByIdController = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id)
  const userId = req.user?._id

  await getMemberRoleInWorkspace(userId, workspaceId)

  const { workspace } = await getWorkspaceByIdService(workspaceId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace fetched successfully",
    workspace,
  })
})

export const getWorkspaceMembersController = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id)
  const userId = req.user?._id

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { members, roles } = await getWorkspaceMembersService(workspaceId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace members retrieved successfully",
    members,
    roles,
  })
})

export const getWorkspaceAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id)
  const userId = req.user?._id

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { analytics } = await getWorkspaceAnalyticsService(workspaceId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace analytics retrieved successfully",
    analytics,
  })
})

export const changeWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id)
    const { memberId, roleId } = changeRoleSchema.parse(req.body)

    const userId = req.user?._id

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE])

    const { member } = await changeMemberRoleService(workspaceId, memberId, roleId)

    return res.status(HTTPSTATUS.OK).json({
      message: "Member Role changed successfully",
      member,
    })
  },
)

export const updateWorkspaceByIdController = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id)
  const { name, description } = updateWorkspaceSchema.parse(req.body)

  const userId = req.user?._id

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_WORKSPACE])

  const { workspace } = await updateWorkspaceByIdService(workspaceId, name, description)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace updated successfully",
    workspace,
  })
})

export const uploadWorkspaceLogoController = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id)
  const userId = req.user?._id

  if (!req.file) {
    throw new BadRequestException("No file provided")
  }

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_WORKSPACE])

  const { workspace } = await uploadWorkspaceLogoService(workspaceId, req.file)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace logo uploaded successfully",
    workspace,
  })
})

export const deleteWorkspaceByIdController = asyncHandler(async (req: Request, res: Response) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id)

  const userId = req.user?._id

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.DELETE_WORKSPACE])

  const { currentWorkspace } = await deleteWorkspaceService(workspaceId, userId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace deleted successfully",
    currentWorkspace,
  })
})

export const getWorkspaceRolesController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.id)

  // Any workspace member can view roles & permissions in the settings panel
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { roles } = await getWorkspaceRolesService()

  return res.status(HTTPSTATUS.OK).json({
    message: "Roles and permissions fetched successfully",
    roles,
  })
})

export const updateRolePermissionsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.id)
  const roleId = z.string().parse(req.params.roleId)
  const permissions = z.array(z.string()).parse(req.body.permissions)

  // Only OWNER can customize/manage RBAC configuration
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  // Additional safety guard: block modifying OWNER role permissions to avoid lockout
  const { roles } = await getWorkspaceRolesService()
  const targetRole = roles.find((r) => r._id.toString() === roleId)
  if (targetRole && targetRole.name === "OWNER") {
    throw new BadRequestException("Permissions for the OWNER role cannot be modified.")
  }

  const { role: updatedRole } = await updateRolePermissionsService(roleId, permissions)

  return res.status(HTTPSTATUS.OK).json({
    message: "Role permissions updated successfully",
    role: updatedRole,
  })
})
