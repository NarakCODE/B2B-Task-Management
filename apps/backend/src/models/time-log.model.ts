import mongoose, { Document, Schema } from "mongoose";

export interface TimeLogDocument extends Document {
  task: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  durationMinutes: number;
  description: string | null;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const timeLogSchema = new Schema<TimeLogDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    loggedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TimeLogModel = mongoose.model<TimeLogDocument>("TimeLog", timeLogSchema);
export default TimeLogModel;
