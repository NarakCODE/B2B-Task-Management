import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import {
  createCheckoutSessionController,
  createPortalSessionController,
  getWorkspaceSubscriptionController,
  handleStripeWebhookController,
} from "../controllers/billing.controller";

const billingRoutes = Router();

// Public Stripe Webhook Endpoint
billingRoutes.post("/webhook", handleStripeWebhookController);

// Protected Billing Endpoints
billingRoutes.post(
  "/checkout/:workspaceId",
  isAuthenticated,
  createCheckoutSessionController
);
billingRoutes.post(
  "/portal/:workspaceId",
  isAuthenticated,
  createPortalSessionController
);
billingRoutes.get(
  "/subscription/:workspaceId",
  isAuthenticated,
  getWorkspaceSubscriptionController
);

export default billingRoutes;
