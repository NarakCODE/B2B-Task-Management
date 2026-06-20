import { Router } from "express"
import isAuthenticated from "../middlewares/isAuthenticated.middleware"
import {
  getPullRequestsByTaskController,
  getPullRequestsByProjectController,
  getWorkspacePullRequestsController,
  generateBranchNameController,
  handlePullRequestWebhookController,
} from "../controllers/pull-request.controller"

const pullRequestRoutes = Router()

pullRequestRoutes.post("/github/webhook/:workspaceId", handlePullRequestWebhookController)

pullRequestRoutes.get(
  "/workspace/:workspaceId/all",
  isAuthenticated,
  getWorkspacePullRequestsController,
)
pullRequestRoutes.get(
  "/:id/workspace/:workspaceId/task",
  isAuthenticated,
  getPullRequestsByTaskController,
)
pullRequestRoutes.get(
  "/project/:projectId/workspace/:workspaceId/all",
  isAuthenticated,
  getPullRequestsByProjectController,
)
pullRequestRoutes.post(
  "/workspace/:workspaceId/generate-branch",
  isAuthenticated,
  generateBranchNameController,
)

export default pullRequestRoutes
