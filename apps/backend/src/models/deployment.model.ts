import mongoose, { Document, Schema } from "mongoose"

export interface DeploymentDocument extends Document {
  provider: string
  environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT"
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED" | "ROLLED_BACK"
  commitSha: string | null
  branch: string | null
  release: string | null
  startedAt: Date | null
  completedAt: Date | null
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  metadata: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
}

const deploymentSchema = new Schema<DeploymentDocument>(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      enum: ["PRODUCTION", "STAGING", "DEVELOPMENT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "SUCCESS", "FAILED", "ROLLED_BACK"],
      default: "PENDING",
    },
    commitSha: {
      type: String,
      default: null,
    },
    branch: {
      type: String,
      default: null,
    },
    release: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
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
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
)

deploymentSchema.index({ workspace: 1, project: 1, createdAt: -1 })

const DeploymentModel = mongoose.model<DeploymentDocument>("Deployment", deploymentSchema)
export default DeploymentModel
