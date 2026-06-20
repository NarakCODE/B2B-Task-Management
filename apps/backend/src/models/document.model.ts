import mongoose, { Document, Schema } from "mongoose"

export const DocumentCategoryEnum = {
  SPEC: "SPEC",
  CONTRACT: "CONTRACT",
  DESIGN: "DESIGN",
  REPORT: "REPORT",
  OTHER: "OTHER",
} as const

export type DocumentCategoryType = keyof typeof DocumentCategoryEnum

export interface WorkspaceDocument extends Document {
  title: string
  description: string | null
  category: DocumentCategoryType
  filename: string
  url: string
  publicId: string
  mimeType: string
  size: number
  workspace: mongoose.Types.ObjectId
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const documentSchema = new Schema<WorkspaceDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      enum: Object.values(DocumentCategoryEnum),
      default: DocumentCategoryEnum.OTHER,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

documentSchema.index({ workspace: 1, createdAt: -1 })
documentSchema.index({ workspace: 1, category: 1 })
documentSchema.index({ title: "text", filename: "text", description: "text" })

const DocumentModel = mongoose.model<WorkspaceDocument>("Document", documentSchema)

export default DocumentModel
