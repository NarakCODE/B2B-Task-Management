import { Router } from "express"
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  deleteWorkspaceByIdController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
  getWorkspaceRolesController,
  updateRolePermissionsController,
  updateWorkspaceByIdController,
  uploadWorkspaceLogoController,
} from "../controllers/workspace.controller"
import { upload } from "../middlewares/upload.middleware"

const workspaceRoutes = Router()

workspaceRoutes.post("/create/new", createWorkspaceController)
workspaceRoutes.put("/update/:id", updateWorkspaceByIdController)
workspaceRoutes.put("/:id/logo", upload.single("logo"), uploadWorkspaceLogoController)

workspaceRoutes.put("/change/member/role/:id", changeWorkspaceMemberRoleController)

workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController)

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController)

workspaceRoutes.get("/members/:id", getWorkspaceMembersController)
workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController)
workspaceRoutes.get("/roles/:id", getWorkspaceRolesController)
workspaceRoutes.put("/:id/role/:roleId/permissions", updateRolePermissionsController)

workspaceRoutes.get("/:id", getWorkspaceByIdController)

export default workspaceRoutes
