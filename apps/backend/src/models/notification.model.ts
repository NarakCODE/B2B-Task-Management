import mongoose, { Schema, Document } from "mongoose"

export interface NotificationDocument extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  project?: mongoose.Types.ObjectId | null
  task?: mongoose.Types.ObjectId | null
  type: "ASSIGNED" | "UNASSIGNED" | "COMMENT" | "STATUS_CHANGE"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    type: {
      type: String,
      enum: ["ASSIGNED", "UNASSIGNED", "COMMENT", "STATUS_CHANGE"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema)

export default NotificationModel
