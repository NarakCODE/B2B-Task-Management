import { Router } from "express"
import {
  createWorkflowController,
  updateWorkflowController,
  getWorkspaceWorkflowsController,
  getWorkflowByIdController,
  deleteWorkflowController,
  getOrCreateDefaultWorkflowController,
} from "../controllers/workflow.controller"

const workflowRoutes = Router()

workflowRoutes.post("/workspace/:workspaceId/create", createWorkflowController)
workflowRoutes.put("/:id/workspace/:workspaceId/update", updateWorkflowController)
workflowRoutes.get("/workspace/:workspaceId/all", getWorkspaceWorkflowsController)
workflowRoutes.get("/workspace/:workspaceId/default", getOrCreateDefaultWorkflowController)
workflowRoutes.get("/:id/workspace/:workspaceId", getWorkflowByIdController)
workflowRoutes.delete("/:id/workspace/:workspaceId/delete", deleteWorkflowController)

export default workflowRoutes
