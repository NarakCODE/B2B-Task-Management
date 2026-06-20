import { Router } from "express"
import {
  createEpicController,
  getEpicsByProjectController,
  getEpicByIdController,
  updateEpicController,
  deleteEpicController,
  getEpicTasksController,
  getEpicProgressController,
} from "../controllers/epic.controller"

const epicRoutes = Router()

epicRoutes.post("/project/:projectId/workspace/:workspaceId/create", createEpicController)
epicRoutes.get("/project/:projectId/workspace/:workspaceId/all", getEpicsByProjectController)
epicRoutes.get("/:id/workspace/:workspaceId", getEpicByIdController)
epicRoutes.put("/:id/workspace/:workspaceId/update", updateEpicController)
epicRoutes.delete("/:id/workspace/:workspaceId/delete", deleteEpicController)
epicRoutes.get("/:id/workspace/:workspaceId/tasks", getEpicTasksController)
epicRoutes.get("/:id/workspace/:workspaceId/progress", getEpicProgressController)

export default epicRoutes
