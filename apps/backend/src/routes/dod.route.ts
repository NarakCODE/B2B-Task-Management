import { Router } from "express"
import {
  createDoDTemplateController,
  listDoDTemplatesController,
  attachDoDToTaskController,
  toggleDoDItemController,
  getTaskDoDController,
} from "../controllers/dod.controller"

const dodRoutes = Router()

dodRoutes.post("/template/workspace/:workspaceId/create", createDoDTemplateController)
dodRoutes.get("/template/workspace/:workspaceId/all", listDoDTemplatesController)
dodRoutes.post("/task/:id/workspace/:workspaceId/attach", attachDoDToTaskController)
dodRoutes.patch("/task/:id/workspace/:workspaceId/item/:itemId/toggle", toggleDoDItemController)
dodRoutes.get("/task/:id/workspace/:workspaceId", getTaskDoDController)

export default dodRoutes
