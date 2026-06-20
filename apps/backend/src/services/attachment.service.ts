import { Readable } from "stream"
import cloudinary from "../config/cloudinary.config"
import TaskModel from "../models/task.model"
import { BadRequestException, NotFoundException } from "../utils/appError"

/**
 * Upload a file buffer to Cloudinary and attach the metadata to a task.
 */
export const uploadTaskAttachmentService = async (
  workspaceId: string,
  taskId: string,
  userId: string,
  file: Express.Multer.File,
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found in this workspace")
  }

  // Stream buffer to Cloudinary
  const uploadResult = await new Promise<{
    secure_url: string
    public_id: string
    original_filename: string
    format: string
    bytes: number
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `task-attachments/${workspaceId}/${taskId}`,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) reject(error || new Error("Upload failed"))
        else resolve(result as any)
      },
    )

    const readable = new Readable()
    readable.push(file.buffer)
    readable.push(null)
    readable.pipe(stream)
  })

  const attachment = {
    filename: file.originalname,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: userId,
  }

  task.attachments.push(attachment as any)
  await task.save()

  const newAttachment = task.attachments[task.attachments.length - 1]
  return { attachment: newAttachment }
}

/**
 * Delete an attachment from Cloudinary and remove it from the task.
 */
export const deleteTaskAttachmentService = async (
  workspaceId: string,
  taskId: string,
  attachmentId: string,
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found in this workspace")
  }

  const attachment = task.attachments.id(attachmentId)
  if (!attachment) {
    throw new NotFoundException("Attachment not found")
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(attachment.publicId, { resource_type: "raw" })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // If image resource type, try again
    try {
      await cloudinary.uploader.destroy(attachment.publicId, { resource_type: "image" })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // Best-effort deletion – proceed even if Cloudinary fails
    }
  }

  task.attachments.pull(attachmentId)
  await task.save()

  return { message: "Attachment deleted successfully" }
}

/**
 * Get all attachments for a task.
 */
export const getTaskAttachmentsService = async (workspaceId: string, taskId: string) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId }).populate(
    "attachments.uploadedBy",
    "_id name profilePicture",
  )
  if (!task) {
    throw new NotFoundException("Task not found in this workspace")
  }
  return { attachments: task.attachments }
}
