import { Router } from "express"
import {
  setCapacityController,
  bulkSetCapacityController,
  getSprintCapacityController,
} from "../controllers/capacity.controller"

const capacityRoutes = Router()

capacityRoutes.post("/workspace/:workspaceId/set", setCapacityController)
capacityRoutes.post("/workspace/:workspaceId/bulk", bulkSetCapacityController)
capacityRoutes.get("/workspace/:workspaceId/sprint/:sprintId", getSprintCapacityController)

export default capacityRoutes
