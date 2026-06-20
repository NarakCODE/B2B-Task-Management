import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { projectIdSchema } from "../validation/project.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  getPullRequestsByTaskService,
  getPullRequestsByProjectService,
  getWorkspacePullRequestsService,
  generateBranchName,
  handlePullRequestWebhookService,
} from "../services/pull-request.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"
import { taskIdSchema } from "../validation/task.validation"

export const getPullRequestsByTaskController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const taskId = taskIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { pullRequests } = await getPullRequestsByTaskService(workspaceId, taskId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Pull requests fetched successfully",
    pullRequests,
  })
})

export const getPullRequestsByProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
    const projectId = projectIdSchema.parse(req.params.projectId)

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const pageSize = parseInt(req.query.pageSize as string) || 10
    const pageNumber = parseInt(req.query.pageNumber as string) || 1

    const result = await getPullRequestsByProjectService(
      workspaceId,
      projectId,
      pageSize,
      pageNumber,
    )

    return res.status(HTTPSTATUS.OK).json({
      message: "Pull requests fetched successfully",
      ...result,
    })
  },
)

export const getWorkspacePullRequestsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const status = req.query.status as string | undefined
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const pageNumber = parseInt(req.query.pageNumber as string) || 1

    const result = await getWorkspacePullRequestsService(workspaceId, pageSize, pageNumber, status)

    return res.status(HTTPSTATUS.OK).json({
      message: "Pull requests fetched successfully",
      ...result,
    })
  },
)

export const generateBranchNameController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const bodySchema = z.object({
    taskCode: z.string().trim().min(1),
    title: z.string().trim().min(1),
  })
  const { taskCode, title } = bodySchema.parse(req.body)

  const branchName = generateBranchName(taskCode, title)

  return res.status(HTTPSTATUS.OK).json({
    message: "Branch name generated successfully",
    branchName,
  })
})

export const handlePullRequestWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

    const result = await handlePullRequestWebhookService(workspaceId, req.body)

    return res.status(HTTPSTATUS.OK).json({
      message: "PR webhook processed successfully",
      result,
    })
  },
)
