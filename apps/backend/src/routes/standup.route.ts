import { Router } from "express"
import {
  createStandupController,
  listStandupsController,
  submitStandupUpdateController,
  getStandupUpdatesController,
  getStandupSummaryController,
} from "../controllers/standup.controller"

const standupRoutes = Router()

standupRoutes.post("/workspace/:workspaceId/create", createStandupController)
standupRoutes.get("/workspace/:workspaceId/all", listStandupsController)
standupRoutes.post("/:id/workspace/:workspaceId/update", submitStandupUpdateController)
standupRoutes.get("/:id/workspace/:workspaceId/updates", getStandupUpdatesController)
standupRoutes.get("/:id/workspace/:workspaceId/summary", getStandupSummaryController)

export default standupRoutes
