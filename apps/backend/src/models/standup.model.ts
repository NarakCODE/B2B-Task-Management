import mongoose, { Document, Schema } from "mongoose"

export interface StandupDocument extends Document {
  workspace: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId | null
  name: string
  schedule: string
  channel: string | null
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface StandupUpdateDocument extends Document {
  standup: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  yesterday: string | null
  today: string | null
  blockers: string | null
  linkedTasks: mongoose.Types.ObjectId[]
  date: Date
  createdAt: Date
  updatedAt: Date
}

const standupSchema = new Schema<StandupDocument>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    schedule: {
      type: String,
      default: "0 9 * * 1-5",
    },
    channel: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

const standupUpdateSchema = new Schema<StandupUpdateDocument>(
  {
    standup: {
      type: Schema.Types.ObjectId,
      ref: "Standup",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    yesterday: {
      type: String,
      default: null,
    },
    today: {
      type: String,
      default: null,
    },
    blockers: {
      type: String,
      default: null,
    },
    linkedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    date: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true },
)

standupUpdateSchema.index({ standup: 1, date: -1 })
standupUpdateSchema.index({ workspace: 1, user: 1, date: -1 })

const StandupModel = mongoose.model<StandupDocument>("Standup", standupSchema)
const StandupUpdateModel = mongoose.model<StandupUpdateDocument>(
  "StandupUpdate",
  standupUpdateSchema,
)

export { StandupModel, StandupUpdateModel }
