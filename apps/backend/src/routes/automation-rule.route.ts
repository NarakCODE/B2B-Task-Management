import { Router } from "express"
import {
  createAutomationRuleController,
  listAutomationRulesController,
  updateAutomationRuleController,
  deleteAutomationRuleController,
} from "../controllers/automation-rule.controller"

const automationRuleRoutes = Router()

automationRuleRoutes.post("/workspace/:workspaceId/create", createAutomationRuleController)
automationRuleRoutes.get("/workspace/:workspaceId/all", listAutomationRulesController)
automationRuleRoutes.put("/:id/workspace/:workspaceId/update", updateAutomationRuleController)
automationRuleRoutes.delete("/:id/workspace/:workspaceId/delete", deleteAutomationRuleController)

export default automationRuleRoutes
