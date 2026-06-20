import mongoose, { Document, Schema } from "mongoose"
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
  TaskTypeEnum,
  TaskTypeEnumType,
} from "../enums/task.enum"
import { generateTaskCode } from "../utils/uuid"

export interface SubTaskDocument extends mongoose.Document {
  title: string
  isCompleted: boolean
  createdAt: Date
}

export interface TaskDependency {
  type: "BLOCKED_BY" | "BLOCKS" | "RELATED" | "PARENT" | "CHILD"
  task: mongoose.Types.ObjectId
}

export interface TaskAttachment extends mongoose.Document {
  filename: string
  url: string
  publicId: string
  mimeType: string
  size: number
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
}

export interface TaskDocument extends Document {
  taskCode: string
  title: string
  description: string | null
  project: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  status: TaskStatusEnumType
  priority: TaskPriorityEnumType
  taskType: TaskTypeEnumType
  storyPoints: number | null
  sortOrder: number
  sprint: mongoose.Types.ObjectId | null
  epic: mongoose.Types.ObjectId | null
  release: mongoose.Types.ObjectId | null
  milestone: mongoose.Types.ObjectId | null
  assignedTo: mongoose.Types.ObjectId | null
  createdBy: mongoose.Types.ObjectId
  dueDate: Date | null
  subtasks: mongoose.Types.DocumentArray<SubTaskDocument>
  dependencies: TaskDependency[]
  attachments: mongoose.Types.DocumentArray<TaskAttachment>
  createdAt: Date
  updatedAt: Date
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
  },
)

const taskDependencySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["BLOCKED_BY", "BLOCKS", "RELATED", "PARENT", "CHILD"],
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
  },
  {
    _id: false,
  },
)

const taskAttachmentSchema = new Schema<TaskAttachment>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

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
    sortOrder: {
      type: Number,
      default: 0,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },
    epic: {
      type: Schema.Types.ObjectId,
      ref: "Epic",
      default: null,
    },
    release: {
      type: Schema.Types.ObjectId,
      ref: "Release",
      default: null,
    },
    milestone: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
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
    dependencies: {
      type: [taskDependencySchema],
      default: [],
    },
    attachments: {
      type: [taskAttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

taskSchema.index({ workspace: 1, sortOrder: 1 })
taskSchema.index({ workspace: 1, sprint: 1, sortOrder: 1 })
taskSchema.index({ workspace: 1, epic: 1 })
taskSchema.index({ workspace: 1, release: 1 })
taskSchema.index({ workspace: 1, milestone: 1 })

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema)

export default TaskModel
