import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  addSubtaskController,
  toggleSubtaskController,
  deleteSubtaskController,
} from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/create",
  createTaskController
);

taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTaskController);

taskRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  updateTaskController
);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);

taskRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  getTaskByIdController
);

taskRoutes.post(
  "/:id/workspace/:workspaceId/subtask/create",
  addSubtaskController
);

taskRoutes.patch(
  "/:id/workspace/:workspaceId/subtask/:subtaskId/toggle",
  toggleSubtaskController
);

taskRoutes.delete(
  "/:id/workspace/:workspaceId/subtask/:subtaskId/delete",
  deleteSubtaskController
);

export default taskRoutes;
