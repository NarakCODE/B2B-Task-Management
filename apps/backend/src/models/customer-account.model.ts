import mongoose, { Document, Schema } from "mongoose"

export interface CustomerAccountDocument extends Document {
  name: string
  tier: "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE"
  slaDueDate: Date | null
  escalationOwner: mongoose.Types.ObjectId | null
  customerPriority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  workspace: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const customerAccountSchema = new Schema<CustomerAccountDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["FREE", "STARTER", "GROWTH", "ENTERPRISE"],
      default: "FREE",
    },
    slaDueDate: {
      type: Date,
      default: null,
    },
    escalationOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerPriority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true },
)

const CustomerAccountModel = mongoose.model<CustomerAccountDocument>(
  "CustomerAccount",
  customerAccountSchema,
)
export default CustomerAccountModel
