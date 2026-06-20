import { Router } from "express"
import isAuthenticated from "../middlewares/isAuthenticated.middleware"
import {
  createDeploymentController,
  getDeploymentsByProjectController,
  getWorkspaceDeploymentsController,
  getDeploymentByIdController,
  handleDeploymentWebhookController,
} from "../controllers/deployment.controller"

const deploymentRoutes = Router()

deploymentRoutes.post("/webhook/:workspaceId", handleDeploymentWebhookController)

deploymentRoutes.post("/workspace/:workspaceId/create", isAuthenticated, createDeploymentController)
deploymentRoutes.get(
  "/workspace/:workspaceId/all",
  isAuthenticated,
  getWorkspaceDeploymentsController,
)
deploymentRoutes.get(
  "/project/:projectId/workspace/:workspaceId/all",
  isAuthenticated,
  getDeploymentsByProjectController,
)
deploymentRoutes.get("/:id/workspace/:workspaceId", isAuthenticated, getDeploymentByIdController)

export default deploymentRoutes
