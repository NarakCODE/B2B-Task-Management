import mongoose, { Document, Schema } from "mongoose"

export interface AutomationRuleDocument extends Document {
  name: string
  description: string | null
  trigger:
    | "TASK_CREATED"
    | "TASK_STATUS_CHANGED"
    | "PR_OPENED"
    | "PR_MERGED"
    | "DUE_DATE_MISSED"
    | "INCIDENT_SEVERITY_CHANGED"
  conditions: Record<string, any> | null
  actions: Array<{
    type: "ASSIGN_USER" | "CHANGE_STATUS" | "NOTIFY_SLACK" | "CREATE_COMMENT" | "SET_PRIORITY"
    params: Record<string, any>
  }>
  isActive: boolean
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const automationRuleSchema = new Schema<AutomationRuleDocument>(
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
    trigger: {
      type: String,
      enum: [
        "TASK_CREATED",
        "TASK_STATUS_CHANGED",
        "PR_OPENED",
        "PR_MERGED",
        "DUE_DATE_MISSED",
        "INCIDENT_SEVERITY_CHANGED",
      ],
      required: true,
    },
    conditions: {
      type: Schema.Types.Mixed,
      default: null,
    },
    actions: [
      {
        type: {
          type: String,
          enum: ["ASSIGN_USER", "CHANGE_STATUS", "NOTIFY_SLACK", "CREATE_COMMENT", "SET_PRIORITY"],
          required: true,
        },
        params: { type: Schema.Types.Mixed, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

const AutomationRuleModel = mongoose.model<AutomationRuleDocument>(
  "AutomationRule",
  automationRuleSchema,
)
export default AutomationRuleModel
