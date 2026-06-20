import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import {
  createOrUpdateIntegrationController,
  getWorkspaceIntegrationsController,
  handleGithubWebhookController,
} from "../controllers/integration.controller";

const integrationRoutes = Router();

// Public webhook endpoint for GitHub (signature verified internally)
integrationRoutes.post("/github/webhook/:workspaceId", handleGithubWebhookController);

// Protected endpoints for configuring integrations
integrationRoutes.post(
  "/workspace/:workspaceId",
  isAuthenticated,
  createOrUpdateIntegrationController
);
integrationRoutes.get(
  "/workspace/:workspaceId",
  isAuthenticated,
  getWorkspaceIntegrationsController
);

export default integrationRoutes;
