import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { projectIdSchema } from "../validation/project.validation"
import {
  createReleaseSchema,
  updateReleaseSchema,
  releaseIdSchema,
} from "../validation/release.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createReleaseService,
  getReleasesByProjectService,
  getReleaseByIdService,
  updateReleaseService,
  deleteReleaseService,
  getReleaseTasksService,
  generateReleaseNotesService,
  getReleaseAnalyticsService,
} from "../services/release.service"
import { HTTPSTATUS } from "../config/http.config"

export const createReleaseController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const projectId = projectIdSchema.parse(req.params.projectId)
  const body = createReleaseSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.CREATE_TASK])

  const { release } = await createReleaseService(workspaceId, projectId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Release created successfully",
    release,
  })
})

export const getReleasesByProjectController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const projectId = projectIdSchema.parse(req.params.projectId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const pageSize = parseInt(req.query.pageSize as string) || 10
  const pageNumber = parseInt(req.query.pageNumber as string) || 1

  const result = await getReleasesByProjectService(workspaceId, projectId, pageSize, pageNumber)

  return res.status(HTTPSTATUS.OK).json({
    message: "Releases fetched successfully",
    ...result,
  })
})

export const getReleaseByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const releaseId = releaseIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { release } = await getReleaseByIdService(workspaceId, releaseId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Release fetched successfully",
    release,
  })
})

export const updateReleaseController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const releaseId = releaseIdSchema.parse(req.params.id)
  const body = updateReleaseSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { release } = await updateReleaseService(workspaceId, releaseId, body)

  return res.status(HTTPSTATUS.OK).json({
    message: "Release updated successfully",
    release,
  })
})

export const deleteReleaseController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const releaseId = releaseIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.DELETE_TASK])

  await deleteReleaseService(workspaceId, releaseId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Release deleted successfully",
  })
})

export const getReleaseTasksController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const releaseId = releaseIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const pageSize = parseInt(req.query.pageSize as string) || 10
  const pageNumber = parseInt(req.query.pageNumber as string) || 1

  const result = await getReleaseTasksService(workspaceId, releaseId, pageSize, pageNumber)

  return res.status(HTTPSTATUS.OK).json({
    message: "Release tasks fetched successfully",
    ...result,
  })
})

export const generateReleaseNotesController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const releaseId = releaseIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const result = await generateReleaseNotesService(workspaceId, releaseId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Release notes generated successfully",
    ...result,
  })
})

export const getReleaseAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const releaseId = releaseIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { analytics, tasksByStatus } = await getReleaseAnalyticsService(workspaceId, releaseId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Release analytics fetched successfully",
    analytics,
    tasksByStatus,
  })
})
