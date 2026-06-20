import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { taskIdSchema } from "../validation/task.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createReviewService,
  approveReviewService,
  rejectReviewService,
  getTaskReviewService,
  listWorkspaceReviewsService,
} from "../services/review.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createReviewController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const taskId = taskIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const bodySchema = z.object({
    reviewers: z.array(z.string().trim().min(1)).min(1),
    requiredApprovals: z.number().int().min(1).optional().default(1),
    comments: z.string().optional(),
  })
  const body = bodySchema.parse(req.body)

  const { review } = await createReviewService(workspaceId, taskId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({ message: "Review created successfully", review })
})

export const approveReviewController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const reviewId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { review } = await approveReviewService(workspaceId, reviewId, userId)

  return res.status(HTTPSTATUS.OK).json({ message: "Review approved", review })
})

export const rejectReviewController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const reviewId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const commentsSchema = z.object({ comments: z.string().optional() })
  const { comments } = commentsSchema.parse(req.body)

  const { review } = await rejectReviewService(workspaceId, reviewId, userId, comments)

  return res.status(HTTPSTATUS.OK).json({ message: "Review rejected", review })
})

export const getTaskReviewController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const taskId = taskIdSchema.parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { review } = await getTaskReviewService(workspaceId, taskId)

  return res.status(HTTPSTATUS.OK).json({ message: "Review fetched successfully", review })
})

export const listWorkspaceReviewsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const status = req.query.status as string | undefined
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const pageNumber = parseInt(req.query.pageNumber as string) || 1

  const result = await listWorkspaceReviewsService(workspaceId, status, pageSize, pageNumber)

  return res.status(HTTPSTATUS.OK).json({ message: "Reviews fetched successfully", ...result })
})
