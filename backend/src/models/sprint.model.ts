import mongoose, { Document, Schema } from "mongoose";

export interface SprintDocument extends Document {
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<SprintDocument>(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "COMPLETED"],
      default: "PLANNED",
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
  {
    timestamps: true,
  }
);

const SprintModel = mongoose.model<SprintDocument>("Sprint", sprintSchema);
export default SprintModel;
