import mongoose, { Document, Schema } from "mongoose";

export interface CommentDocument extends Document {
  content: string;
  task: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
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
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<CommentDocument>("Comment", commentSchema);
export default CommentModel;
