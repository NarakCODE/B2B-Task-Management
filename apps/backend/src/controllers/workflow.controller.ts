import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { createWorkflowSchema, updateWorkflowSchema } from "../validation/workflow.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createWorkflowService,
  updateWorkflowService,
  getWorkspaceWorkflowsService,
  getWorkflowByIdService,
  deleteWorkflowService,
  getOrCreateDefaultWorkflowService,
} from "../services/workflow.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createWorkflowController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const body = createWorkflowSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const { workflow } = await createWorkflowService(workspaceId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Workflow created successfully",
    workflow,
  })
})

export const updateWorkflowController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const workflowId = z.string().trim().min(1).parse(req.params.id)
  const body = updateWorkflowSchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const { workflow } = await updateWorkflowService(workspaceId, workflowId, body)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workflow updated successfully",
    workflow,
  })
})

export const getWorkspaceWorkflowsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { workflows } = await getWorkspaceWorkflowsService(workspaceId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workflows fetched successfully",
    workflows,
  })
})

export const getWorkflowByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const workflowId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { workflow } = await getWorkflowByIdService(workspaceId, workflowId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workflow fetched successfully",
    workflow,
  })
})

export const deleteWorkflowController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const workflowId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  await deleteWorkflowService(workspaceId, workflowId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Workflow deleted successfully",
  })
})

export const getOrCreateDefaultWorkflowController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
    const projectId = req.query.project as string | undefined

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const { workflow } = await getOrCreateDefaultWorkflowService(workspaceId, projectId || null)

    return res.status(HTTPSTATUS.OK).json({
      message: "Workflow fetched successfully",
      workflow,
    })
  },
)
