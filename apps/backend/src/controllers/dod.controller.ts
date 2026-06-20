import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { taskIdSchema } from "../validation/task.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createDoDTemplateService,
  listDoDTemplatesService,
  updateDoDTemplateService,
  deleteDoDTemplateService,
  attachDoDToTaskService,
  toggleDoDItemService,
  getTaskDoDService,
} from "../services/dod.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createDoDTemplateController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const bodySchema = z.object({
    name: z.string().trim().min(1),
    project: z.string().trim().optional().nullable(),
    taskType: z.string().trim().optional().nullable(),
    items: z
      .array(
        z.object({
          description: z.string().trim().min(1),
          isRequired: z.boolean().optional().default(true),
          order: z.number().int().min(0).optional(),
        }),
      )
      .min(1),
  })
  const body = bodySchema.parse(req.body)

  const { template } = await createDoDTemplateService(workspaceId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({ message: "DoD template created", template })
})

export const listDoDTemplatesController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const projectId = req.query.projectId as string | undefined
  const taskType = req.query.taskType as string | undefined

  const { templates } = await listDoDTemplatesService(workspaceId, projectId, taskType)

  return res.status(HTTPSTATUS.OK).json({ message: "DoD templates fetched", templates })
})

export const attachDoDToTaskController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const taskId = taskIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { templateId } = z.object({ templateId: z.string().trim().min(1) }).parse(req.body)

  const { taskDoD } = await attachDoDToTaskService(workspaceId, taskId, templateId)

  return res.status(HTTPSTATUS.OK).json({ message: "DoD attached to task", taskDoD })
})

export const toggleDoDItemController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const taskId = taskIdSchema.parse(req.params.id)
  const itemId = z.string().trim().min(1).parse(req.params.itemId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { taskDoD } = await toggleDoDItemService(workspaceId, taskId, itemId, userId)

  return res.status(HTTPSTATUS.OK).json({ message: "DoD item toggled", taskDoD })
})

export const getTaskDoDController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const taskId = taskIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { taskDoD, canComplete } = await getTaskDoDService(workspaceId, taskId)

  return res.status(HTTPSTATUS.OK).json({ message: "DoD fetched", taskDoD, canComplete })
})
