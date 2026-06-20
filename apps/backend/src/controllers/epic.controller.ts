import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { projectIdSchema } from "../validation/project.validation"
import { createEpicSchema, updateEpicSchema, epicIdSchema } from "../validation/epic.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createEpicService,
  getEpicsByProjectService,
  getEpicByIdService,
  updateEpicService,
  deleteEpicService,
  getEpicTasksService,
  getEpicProgressService,
} from "../services/epic.service"
import { HTTPSTATUS } from "../config/http.config"

export const createEpicController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const projectId = projectIdSchema.parse(req.params.projectId)
  const body = createEpicSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.CREATE_TASK])

  const { epic } = await createEpicService(workspaceId, projectId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Epic created successfully",
    epic,
  })
})

export const getEpicsByProjectController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const projectId = projectIdSchema.parse(req.params.projectId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const pageSize = parseInt(req.query.pageSize as string) || 10
  const pageNumber = parseInt(req.query.pageNumber as string) || 1

  const result = await getEpicsByProjectService(workspaceId, projectId, pageSize, pageNumber)

  return res.status(HTTPSTATUS.OK).json({
    message: "Epics fetched successfully",
    ...result,
  })
})

export const getEpicByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const epicId = epicIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { epic } = await getEpicByIdService(workspaceId, epicId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Epic fetched successfully",
    epic,
  })
})

export const updateEpicController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const epicId = epicIdSchema.parse(req.params.id)
  const body = updateEpicSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { epic } = await updateEpicService(workspaceId, epicId, body)

  return res.status(HTTPSTATUS.OK).json({
    message: "Epic updated successfully",
    epic,
  })
})

export const deleteEpicController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const epicId = epicIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.DELETE_TASK])

  await deleteEpicService(workspaceId, epicId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Epic deleted successfully",
  })
})

export const getEpicTasksController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const epicId = epicIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const pageSize = parseInt(req.query.pageSize as string) || 10
  const pageNumber = parseInt(req.query.pageNumber as string) || 1

  const result = await getEpicTasksService(workspaceId, epicId, pageSize, pageNumber)

  return res.status(HTTPSTATUS.OK).json({
    message: "Epic tasks fetched successfully",
    ...result,
  })
})

export const getEpicProgressController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const epicId = epicIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { progress, tasksByStatus } = await getEpicProgressService(workspaceId, epicId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Epic progress fetched successfully",
    progress,
    tasksByStatus,
  })
})
