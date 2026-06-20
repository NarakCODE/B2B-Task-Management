import mongoose, { Document, Schema } from "mongoose"

export interface DoDItemDocument extends Document {
  description: string
  isRequired: boolean
  order: number
}

export interface DoDTemplateDocument extends Document {
  name: string
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  taskType: string | null
  items: mongoose.Types.DocumentArray<DoDItemDocument>
  createdAt: Date
  updatedAt: Date
}

export interface TaskDoDDocument extends Document {
  task: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  template: mongoose.Types.ObjectId | null
  items: Array<{
    itemId: string
    description: string
    isRequired: boolean
    isCompleted: boolean
    completedBy: mongoose.Types.ObjectId | null
    completedAt: Date | null
  }>
  allCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

const dodItemSchema = new Schema<DoDItemDocument>(
  {
    description: { type: String, required: true },
    isRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true },
)

const dodTemplateSchema = new Schema<DoDTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    taskType: {
      type: String,
      default: null,
    },
    items: {
      type: [dodItemSchema],
      default: [],
    },
  },
  { timestamps: true },
)

const taskDoDSchema = new Schema<TaskDoDDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    template: {
      type: Schema.Types.ObjectId,
      ref: "DoDTemplate",
      default: null,
    },
    items: [
      {
        itemId: { type: String, required: true },
        description: { type: String, required: true },
        isRequired: { type: Boolean, default: true },
        isCompleted: { type: Boolean, default: false },
        completedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        completedAt: { type: Date, default: null },
      },
    ],
    allCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

taskDoDSchema.index({ task: 1 })
taskDoDSchema.index({ workspace: 1 })

const DoDTemplateModel = mongoose.model<DoDTemplateDocument>("DoDTemplate", dodTemplateSchema)
const TaskDoDModel = mongoose.model<TaskDoDDocument>("TaskDoD", taskDoDSchema)

export { DoDTemplateModel, TaskDoDModel }
