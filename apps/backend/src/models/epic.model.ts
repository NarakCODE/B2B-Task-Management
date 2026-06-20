import mongoose, { Document, Schema } from "mongoose"

export interface EpicDocument extends Document {
  name: string
  description: string | null
  status: "OPEN" | "IN_PROGRESS" | "DONE"
  project: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  owner: mongoose.Types.ObjectId | null
  startDate: Date | null
  targetDate: Date | null
  createdAt: Date
  updatedAt: Date
}

const epicSchema = new Schema<EpicDocument>(
  {
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
      enum: ["OPEN", "IN_PROGRESS", "DONE"],
      default: "OPEN",
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    targetDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

epicSchema.index({ workspace: 1, project: 1 })

const EpicModel = mongoose.model<EpicDocument>("Epic", epicSchema)
export default EpicModel
