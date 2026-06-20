import mongoose, { Document, Schema } from "mongoose"

export interface TaskReviewDocument extends Document {
  task: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  reviewers: mongoose.Types.ObjectId[]
  status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
  requiredApprovals: number
  approvedBy: mongoose.Types.ObjectId[]
  rejectedBy: mongoose.Types.ObjectId[]
  comments: string | null
  createdAt: Date
  updatedAt: Date
}

const taskReviewSchema = new Schema<TaskReviewDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    reviewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CHANGES_REQUESTED"],
      default: "PENDING",
    },
    requiredApprovals: {
      type: Number,
      default: 1,
    },
    approvedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rejectedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
)

taskReviewSchema.index({ task: 1 })
taskReviewSchema.index({ workspace: 1, status: 1 })

const TaskReviewModel = mongoose.model<TaskReviewDocument>("TaskReview", taskReviewSchema)
export default TaskReviewModel
