import mongoose, { Document, Schema } from "mongoose"
import { WorkflowCategoryEnum, WorkflowCategoryEnumType } from "../enums/workflow.enum"

export interface WorkflowStateDocument extends Document {
  name: string
  category: WorkflowCategoryEnumType
  color: string
  order: number
  isDefault: boolean
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowDocument extends Document {
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  states: mongoose.Types.DocumentArray<WorkflowStateDocument>
  createdAt: Date
  updatedAt: Date
}

const workflowStateSchema = new Schema<WorkflowStateDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(WorkflowCategoryEnum),
      required: true,
    },
    color: {
      type: String,
      default: "#6b7280",
    },
    order: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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
  },
  { timestamps: true },
)

const workflowSchema = new Schema<WorkflowDocument>(
  {
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
    states: {
      type: [workflowStateSchema],
      default: [],
    },
  },
  { timestamps: true },
)

workflowSchema.index({ workspace: 1, project: 1 }, { unique: true })

const WorkflowModel = mongoose.model<WorkflowDocument>("Workflow", workflowSchema)
export default WorkflowModel
