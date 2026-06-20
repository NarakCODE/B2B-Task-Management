import mongoose, { Document, Schema } from "mongoose";

export interface IntegrationDocument extends Document {
  workspace: mongoose.Types.ObjectId;
  provider: "GITHUB" | "SLACK";
  webhookUrl?: string; // For outgoing webhooks like Slack
  secret?: string;      // For incoming webhooks like GitHub signature verification
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IntegrationDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    provider: {
      type: String,
      enum: ["GITHUB", "SLACK"],
      required: true,
    },
    webhookUrl: {
      type: String,
      default: null,
    },
    secret: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const IntegrationModel = mongoose.model<IntegrationDocument>("Integration", integrationSchema);
export default IntegrationModel;
