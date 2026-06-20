import mongoose, { Document, Schema } from "mongoose";

export interface SubscriptionDocument extends Document {
  workspace: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "active" | "canceled" | "past_due" | "incomplete" | "trialing" | "unpaid";
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due", "incomplete", "trialing", "unpaid"],
      default: "active",
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionModel = mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);
export default SubscriptionModel;
