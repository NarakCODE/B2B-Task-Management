import { Router } from "express"
import {
  createReleaseController,
  getReleasesByProjectController,
  getReleaseByIdController,
  updateReleaseController,
  deleteReleaseController,
  getReleaseTasksController,
  generateReleaseNotesController,
  getReleaseAnalyticsController,
} from "../controllers/release.controller"

const releaseRoutes = Router()

releaseRoutes.post("/project/:projectId/workspace/:workspaceId/create", createReleaseController)
releaseRoutes.get("/project/:projectId/workspace/:workspaceId/all", getReleasesByProjectController)
releaseRoutes.get("/:id/workspace/:workspaceId", getReleaseByIdController)
releaseRoutes.put("/:id/workspace/:workspaceId/update", updateReleaseController)
releaseRoutes.delete("/:id/workspace/:workspaceId/delete", deleteReleaseController)
releaseRoutes.get("/:id/workspace/:workspaceId/tasks", getReleaseTasksController)
releaseRoutes.get("/:id/workspace/:workspaceId/release-notes", generateReleaseNotesController)
releaseRoutes.get("/:id/workspace/:workspaceId/analytics", getReleaseAnalyticsController)

export default releaseRoutes
