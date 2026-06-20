import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createAutomationRuleService,
  listAutomationRulesService,
  updateAutomationRuleService,
  deleteAutomationRuleService,
  executeAutomationRulesService,
} from "../services/automation-rule.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createAutomationRuleController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const bodySchema = z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().optional(),
    trigger: z.enum([
      "TASK_CREATED",
      "TASK_STATUS_CHANGED",
      "PR_OPENED",
      "PR_MERGED",
      "DUE_DATE_MISSED",
      "INCIDENT_SEVERITY_CHANGED",
    ]),
    conditions: z.any().optional().nullable(),
    actions: z
      .array(
        z.object({
          type: z.enum([
            "ASSIGN_USER",
            "CHANGE_STATUS",
            "NOTIFY_SLACK",
            "CREATE_COMMENT",
            "SET_PRIORITY",
          ]),
          params: z.any(),
        }),
      )
      .min(1),
    project: z.string().trim().optional().nullable(),
  })
  const body = bodySchema.parse(req.body)

  const { rule } = await createAutomationRuleService(workspaceId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({ message: "Automation rule created", rule })
})

export const listAutomationRulesController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const projectId = req.query.projectId as string | undefined
  const trigger = req.query.trigger as string | undefined

  const { rules } = await listAutomationRulesService(workspaceId, projectId, trigger)

  return res.status(HTTPSTATUS.OK).json({ message: "Automation rules fetched", rules })
})

export const updateAutomationRuleController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const ruleId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const bodySchema = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    trigger: z.string().optional(),
    conditions: z.any().optional().nullable(),
    actions: z
      .array(
        z.object({
          type: z.string(),
          params: z.any(),
        }),
      )
      .optional(),
    isActive: z.boolean().optional(),
  })
  const body = bodySchema.parse(req.body)

  const { rule } = await updateAutomationRuleService(workspaceId, ruleId, body)

  return res.status(HTTPSTATUS.OK).json({ message: "Automation rule updated", rule })
})

export const deleteAutomationRuleController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const ruleId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  await deleteAutomationRuleService(workspaceId, ruleId)

  return res.status(HTTPSTATUS.OK).json({ message: "Automation rule deleted" })
})
