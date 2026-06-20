import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { projectIdSchema } from "../validation/project.validation"
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  milestoneIdSchema,
} from "../validation/milestone.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createMilestoneService,
  getMilestonesByProjectService,
  getMilestoneByIdService,
  updateMilestoneService,
  deleteMilestoneService,
  getMilestoneProgressService,
  addMilestoneToEpicsService,
} from "../services/milestone.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createMilestoneController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const projectId = projectIdSchema.parse(req.params.projectId)
  const body = createMilestoneSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.CREATE_TASK])

  const { milestone } = await createMilestoneService(workspaceId, projectId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Milestone created successfully",
    milestone,
  })
})

export const getMilestonesByProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
    const projectId = projectIdSchema.parse(req.params.projectId)

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const pageSize = parseInt(req.query.pageSize as string) || 10
    const pageNumber = parseInt(req.query.pageNumber as string) || 1

    const result = await getMilestonesByProjectService(workspaceId, projectId, pageSize, pageNumber)

    return res.status(HTTPSTATUS.OK).json({
      message: "Milestones fetched successfully",
      ...result,
    })
  },
)

export const getMilestoneByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const milestoneId = milestoneIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { milestone } = await getMilestoneByIdService(workspaceId, milestoneId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Milestone fetched successfully",
    milestone,
  })
})

export const updateMilestoneController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const milestoneId = milestoneIdSchema.parse(req.params.id)
  const body = updateMilestoneSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { milestone } = await updateMilestoneService(workspaceId, milestoneId, body)

  return res.status(HTTPSTATUS.OK).json({
    message: "Milestone updated successfully",
    milestone,
  })
})

export const deleteMilestoneController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const milestoneId = milestoneIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.DELETE_TASK])

  await deleteMilestoneService(workspaceId, milestoneId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Milestone deleted successfully",
  })
})

export const getMilestoneProgressController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const milestoneId = milestoneIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { progress, tasksByStatus } = await getMilestoneProgressService(workspaceId, milestoneId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Milestone progress fetched successfully",
    progress,
    tasksByStatus,
  })
})

export const addMilestoneToEpicsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const milestoneId = milestoneIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const epicIdsSchema = z.object({ epicIds: z.array(z.string().trim().min(1)).min(1) })
  const { epicIds } = epicIdsSchema.parse(req.body)

  await addMilestoneToEpicsService(workspaceId, milestoneId, epicIds)

  return res.status(HTTPSTATUS.OK).json({
    message: "Milestone linked to epics successfully",
  })
})
