import mongoose, { Document, Schema } from "mongoose";
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
  TaskTypeEnum,
  TaskTypeEnumType,
} from "../enums/task.enum";
import { generateTaskCode } from "../utils/uuid";

export interface SubTaskDocument extends mongoose.Document {
  title: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  taskType: TaskTypeEnumType;
  storyPoints: number | null;
  sprint: mongoose.Types.ObjectId | null;
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  dueDate: Date | null;
  subtasks: mongoose.Types.DocumentArray<SubTaskDocument>;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<SubTaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const taskSchema = new Schema<TaskDocument>(
  {
    taskCode: {
      type: String,
      unique: true,
      default: generateTaskCode,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
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
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum),
      default: TaskStatusEnum.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum),
      default: TaskPriorityEnum.MEDIUM,
    },
    taskType: {
      type: String,
      enum: Object.values(TaskTypeEnum),
      default: TaskTypeEnum.FEATURE,
    },
    storyPoints: {
      type: Number,
      default: null,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);

export default TaskModel;
