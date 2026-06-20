import mongoose, { Document, Schema } from "mongoose"

export interface MilestoneDocument extends Document {
  name: string
  description: string | null
  dueDate: Date | null
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED"
  project: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const milestoneSchema = new Schema<MilestoneDocument>(
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
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "COMPLETED"],
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

milestoneSchema.index({ workspace: 1, project: 1 })

const MilestoneModel = mongoose.model<MilestoneDocument>("Milestone", milestoneSchema)
export default MilestoneModel
