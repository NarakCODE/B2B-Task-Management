import mongoose, { Document, Schema } from "mongoose"

export interface PullRequestDocument extends Document {
  prNumber: number
  title: string
  url: string
  branch: string
  author: string
  authorAvatar: string | null
  status: "OPEN" | "CLOSED" | "MERGED"
  mergedAt: Date | null
  mergedBy: string | null
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  tasks: mongoose.Types.ObjectId[]
  integration: mongoose.Types.ObjectId
  repository: string
  createdAt: Date
  updatedAt: Date
}

const pullRequestSchema = new Schema<PullRequestDocument>(
  {
    prNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "MERGED"],
      default: "OPEN",
    },
    mergedAt: {
      type: Date,
      default: null,
    },
    mergedBy: {
      type: String,
      default: null,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    integration: {
      type: Schema.Types.ObjectId,
      ref: "Integration",
      required: true,
    },
    repository: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

pullRequestSchema.index({ workspace: 1, prNumber: 1, repository: 1 }, { unique: true })
pullRequestSchema.index({ workspace: 1, tasks: 1 })

const PullRequestModel = mongoose.model<PullRequestDocument>("PullRequest", pullRequestSchema)
export default PullRequestModel
