import { Router } from "express"
import { exportAuditController } from "../controllers/audit.controller"

const auditRoutes = Router()

auditRoutes.get("/workspace/:workspaceId/export", exportAuditController)

export default auditRoutes
