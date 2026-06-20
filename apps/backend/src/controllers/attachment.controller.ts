import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { taskIdSchema } from "../validation/task.validation"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import { Permissions } from "../enums/role.enum"
import { HTTPSTATUS } from "../config/http.config"
import {
  uploadTaskAttachmentService,
  deleteTaskAttachmentService,
  getTaskAttachmentsService,
} from "../services/attachment.service"
import { BadRequestException } from "../utils/appError"
import { z } from "zod"

export const uploadTaskAttachmentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const taskId = taskIdSchema.parse(req.params.id)
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  if (!req.file) {
    throw new BadRequestException("No file provided")
  }

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { attachment } = await uploadTaskAttachmentService(workspaceId, taskId, userId, req.file)

  return res.status(HTTPSTATUS.OK).json({
    message: "Attachment uploaded successfully",
    attachment,
  })
})

export const getTaskAttachmentsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const taskId = taskIdSchema.parse(req.params.id)
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { attachments } = await getTaskAttachmentsService(workspaceId, taskId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Attachments fetched successfully",
    attachments,
  })
})

export const deleteTaskAttachmentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const taskId = taskIdSchema.parse(req.params.id)
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const attachmentId = z.string().trim().min(1).parse(req.params.attachmentId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  await deleteTaskAttachmentService(workspaceId, taskId, attachmentId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Attachment deleted successfully",
  })
})
