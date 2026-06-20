import { Readable } from "stream"
import cloudinary from "../config/cloudinary.config"
import DocumentModel from "../models/document.model"
import { NotFoundException } from "../utils/appError"
import { DocumentCategoryType } from "../models/document.model"

const uploadDocumentToCloudinary = async (workspaceId: string, file: Express.Multer.File) => {
  return new Promise<{
    secure_url: string
    public_id: string
    bytes: number
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `workspace-documents/${workspaceId}`,
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
}

export const createDocumentService = async ({
  workspaceId,
  userId,
  file,
  title,
  description,
  category = "OTHER",
}: {
  workspaceId: string
  userId: string
  file: Express.Multer.File
  title?: string
  description?: string
  category?: DocumentCategoryType
}) => {
  const uploadResult = await uploadDocumentToCloudinary(workspaceId, file)

  const document = await DocumentModel.create({
    title: title || file.originalname,
    description: description || null,
    category,
    filename: file.originalname,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    mimeType: file.mimetype,
    size: file.size,
    workspace: workspaceId,
    uploadedBy: userId,
  })

  await document.populate("uploadedBy", "_id name profilePicture")

  return { document }
}

export const getDocumentsService = async ({
  workspaceId,
  keyword,
  category,
}: {
  workspaceId: string
  keyword?: string
  category?: DocumentCategoryType
}) => {
  const query: Record<string, unknown> = { workspace: workspaceId }

  if (category) {
    query.category = category
  }

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { filename: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ]
  }

  const documents = await DocumentModel.find(query)
    .populate("uploadedBy", "_id name profilePicture")
    .sort({ createdAt: -1 })

  return { documents }
}

export const deleteDocumentService = async (workspaceId: string, documentId: string) => {
  const document = await DocumentModel.findOne({ _id: documentId, workspace: workspaceId })

  if (!document) {
    throw new NotFoundException("Document not found in this workspace")
  }

  try {
    await cloudinary.uploader.destroy(document.publicId, { resource_type: "raw" })
  } catch (_) {
    try {
      await cloudinary.uploader.destroy(document.publicId, { resource_type: "image" })
    } catch (_e) {
      // Best-effort Cloudinary cleanup; the database record is still removed.
    }
  }

  await document.deleteOne()

  return { message: "Document deleted successfully" }
}
