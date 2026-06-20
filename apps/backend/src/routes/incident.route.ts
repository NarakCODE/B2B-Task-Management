import { Router } from "express"
import {
  createIncidentController,
  getIncidentsController,
  getIncidentByIdController,
  updateIncidentController,
} from "../controllers/incident.controller"

const incidentRoutes = Router()

incidentRoutes.post("/workspace/:workspaceId/create", createIncidentController)
incidentRoutes.get("/workspace/:workspaceId/all", getIncidentsController)
incidentRoutes.get("/:id/workspace/:workspaceId", getIncidentByIdController)
incidentRoutes.put("/:id/workspace/:workspaceId/update", updateIncidentController)

export default incidentRoutes
