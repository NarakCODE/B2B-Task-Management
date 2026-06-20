import mongoose, { Document, Schema } from "mongoose"

export interface IncidentDocument extends Document {
  title: string
  description: string | null
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  environment: string | null
  impact: string | null
  rootCause: string | null
  status: "DETECTED" | "INVESTIGATING" | "MITIGATED" | "RESOLVED" | "CLOSED"
  owner: mongoose.Types.ObjectId | null
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  task: mongoose.Types.ObjectId | null
  release: mongoose.Types.ObjectId | null
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const incidentSchema = new Schema<IncidentDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      required: true,
    },
    environment: {
      type: String,
      default: null,
    },
    impact: {
      type: String,
      default: null,
    },
    rootCause: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["DETECTED", "INVESTIGATING", "MITIGATED", "RESOLVED", "CLOSED"],
      default: "DETECTED",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    release: {
      type: Schema.Types.ObjectId,
      ref: "Release",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

incidentSchema.index({ workspace: 1, status: 1 })
incidentSchema.index({ workspace: 1, severity: 1 })

const IncidentModel = mongoose.model<IncidentDocument>("Incident", incidentSchema)
export default IncidentModel
