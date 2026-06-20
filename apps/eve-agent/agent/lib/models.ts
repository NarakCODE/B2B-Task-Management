import mongoose, { Schema, Document } from "mongoose";

// --- Workspace ---
export interface WorkspaceDocument extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  inviteCode: string;
}

const workspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inviteCode: { type: String, required: true },
  },
  { timestamps: true }
);

export const WorkspaceModel = mongoose.models.Workspace || mongoose.model<WorkspaceDocument>("Workspace", workspaceSchema);

// --- Project ---
export interface ProjectDocument extends Document {
  name: string;
  description?: string;
  emoji: string;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    emoji: { type: String, default: "📊" },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.models.Project || mongoose.model<ProjectDocument>("Project", projectSchema);

// --- User ---
export interface UserDocument extends Document {
  name: string;
  email: string;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

// --- Task ---
export interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: string;
  priority: string;
  taskType: string;
  storyPoints: number | null;
  sprint: mongoose.Types.ObjectId | null;
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<TaskDocument>(
  {
    taskCode: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    status: { type: String, default: "TODO" },
    priority: { type: String, default: "MEDIUM" },
    taskType: { type: String, default: "FEATURE" },
    storyPoints: { type: Number, default: null },
    sprint: { type: Schema.Types.ObjectId, ref: "Sprint", default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.models.Task || mongoose.model<TaskDocument>("Task", taskSchema);
