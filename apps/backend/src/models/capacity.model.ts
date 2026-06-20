import mongoose, { Document, Schema } from "mongoose"

export interface CapacityDocument extends Document {
  sprint: mongoose.Types.ObjectId
  member: mongoose.Types.ObjectId
  workspace: mongoose.Types.ObjectId
  availableHours: number
  plannedStoryPoints: number
  createdAt: Date
  updatedAt: Date
}

const capacitySchema = new Schema<CapacityDocument>(
  {
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      required: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    availableHours: {
      type: Number,
      default: 0,
    },
    plannedStoryPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

capacitySchema.index({ workspace: 1, sprint: 1, member: 1 }, { unique: true })

const CapacityModel = mongoose.model<CapacityDocument>("Capacity", capacitySchema)
export default CapacityModel
