import mongoose, { Document, Schema } from "mongoose";

export interface ActivityLogDocument extends Document {
  workspace: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId | null;
  sprint?: mongoose.Types.ObjectId | null;
  task?: mongoose.Types.ObjectId | null;
  user: mongoose.Types.ObjectId;
  actionType: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<ActivityLogDocument>(
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
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLogModel = mongoose.model<ActivityLogDocument>(
  "ActivityLog",
  activityLogSchema
);
export default ActivityLogModel;
