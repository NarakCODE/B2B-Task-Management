import { Router } from "express"
import {
  uploadTaskAttachmentController,
  getTaskAttachmentsController,
  deleteTaskAttachmentController,
} from "../controllers/attachment.controller"
import { upload } from "../middlewares/upload.middleware"

const attachmentRoutes = Router()

// POST  /task/:id/workspace/:workspaceId/attachments  – upload file
attachmentRoutes.post(
  "/:id/workspace/:workspaceId/attachments",
  upload.single("file"),
  uploadTaskAttachmentController,
)

// GET   /task/:id/workspace/:workspaceId/attachments  – list attachments
attachmentRoutes.get("/:id/workspace/:workspaceId/attachments", getTaskAttachmentsController)

// DELETE /task/:id/workspace/:workspaceId/attachments/:attachmentId
attachmentRoutes.delete(
  "/:id/workspace/:workspaceId/attachments/:attachmentId",
  deleteTaskAttachmentController,
)

export default attachmentRoutes
