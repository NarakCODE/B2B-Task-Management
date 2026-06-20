import mongoose, { Document, Schema } from "mongoose"

export interface ReleaseDocument extends Document {
  version: string
  name: string
  description: string | null
  status: "PLANNED" | "IN_PROGRESS" | "RELEASED" | "CANCELLED"
  targetDate: Date | null
  releasedAt: Date | null
  project: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const releaseSchema = new Schema<ReleaseDocument>(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PLANNED", "IN_PROGRESS", "RELEASED", "CANCELLED"],
      default: "PLANNED",
    },
    targetDate: {
      type: Date,
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

releaseSchema.index({ workspace: 1, project: 1 })

const ReleaseModel = mongoose.model<ReleaseDocument>("Release", releaseSchema)
export default ReleaseModel
