import { Router } from "express";
import {
  createSprintController,
  updateSprintController,
  getProjectSprintsController,
  getSprintByIdController,
  deleteSprintController,
} from "../controllers/sprint.controller";

const sprintRoutes = Router();

sprintRoutes.post(
  "/project/:projectId/workspace/:workspaceId/create",
  createSprintController
);

sprintRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  updateSprintController
);

sprintRoutes.get(
  "/project/:projectId/workspace/:workspaceId/all",
  getProjectSprintsController
);

sprintRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  getSprintByIdController
);

sprintRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteSprintController
);

export default sprintRoutes;
