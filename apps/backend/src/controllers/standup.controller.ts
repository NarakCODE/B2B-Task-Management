import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createStandupService,
  listStandupsService,
  submitStandupUpdateService,
  getStandupUpdatesService,
  getStandupSummaryService,
} from "../services/standup.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createStandupController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const bodySchema = z.object({
    name: z.string().trim().min(1),
    project: z.string().trim().optional().nullable(),
    schedule: z.string().trim().optional(),
    channel: z.string().trim().optional().nullable(),
  })
  const body = bodySchema.parse(req.body)

  const { standup } = await createStandupService(workspaceId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({ message: "Standup created", standup })
})

export const listStandupsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const projectId = req.query.projectId as string | undefined
  const { standups } = await listStandupsService(workspaceId, projectId)

  return res.status(HTTPSTATUS.OK).json({ message: "Standups fetched", standups })
})

export const submitStandupUpdateController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const standupId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const bodySchema = z.object({
    yesterday: z.string().trim().optional(),
    today: z.string().trim().optional(),
    blockers: z.string().trim().optional(),
    linkedTasks: z.array(z.string().trim().min(1)).optional(),
  })
  const body = bodySchema.parse(req.body)

  const result = await submitStandupUpdateService(workspaceId, standupId, userId, body)

  return res.status(HTTPSTATUS.OK).json({ message: "Standup update submitted", ...result })
})

export const getStandupUpdatesController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const standupId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const date = req.query.date as string | undefined
  const result = await getStandupUpdatesService(workspaceId, standupId, date)

  return res.status(HTTPSTATUS.OK).json({ message: "Standup updates fetched", ...result })
})

export const getStandupSummaryController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const standupId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const result = await getStandupSummaryService(workspaceId, standupId)

  return res.status(HTTPSTATUS.OK).json({ message: "Standup summary fetched", ...result })
})
