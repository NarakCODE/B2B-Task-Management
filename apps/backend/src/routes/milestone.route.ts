import { Router } from "express"
import {
  createMilestoneController,
  getMilestonesByProjectController,
  getMilestoneByIdController,
  updateMilestoneController,
  deleteMilestoneController,
  getMilestoneProgressController,
  addMilestoneToEpicsController,
} from "../controllers/milestone.controller"

const milestoneRoutes = Router()

milestoneRoutes.post("/project/:projectId/workspace/:workspaceId/create", createMilestoneController)
milestoneRoutes.get(
  "/project/:projectId/workspace/:workspaceId/all",
  getMilestonesByProjectController,
)
milestoneRoutes.get("/:id/workspace/:workspaceId", getMilestoneByIdController)
milestoneRoutes.put("/:id/workspace/:workspaceId/update", updateMilestoneController)
milestoneRoutes.delete("/:id/workspace/:workspaceId/delete", deleteMilestoneController)
milestoneRoutes.get("/:id/workspace/:workspaceId/progress", getMilestoneProgressController)
milestoneRoutes.post("/:id/workspace/:workspaceId/link-epics", addMilestoneToEpicsController)

export default milestoneRoutes
