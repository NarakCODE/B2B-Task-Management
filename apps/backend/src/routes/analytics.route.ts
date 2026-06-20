import { Router } from "express"
import {
  getCycleTimeController,
  getSprintHealthController,
  getWorkspaceVelocityController,
  getEngineeringDashboardController,
} from "../controllers/analytics.controller"

const analyticsRoutes = Router()

analyticsRoutes.get("/workspace/:workspaceId/cycle-time", getCycleTimeController)
analyticsRoutes.get("/workspace/:workspaceId/sprint/:sprintId/health", getSprintHealthController)
analyticsRoutes.get("/workspace/:workspaceId/velocity", getWorkspaceVelocityController)
analyticsRoutes.get("/workspace/:workspaceId/engineering", getEngineeringDashboardController)

export default analyticsRoutes
