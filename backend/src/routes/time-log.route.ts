import { Router } from "express";
import {
  logTimeController,
  getTaskTimeLogsController,
  getProjectTimeLogsController,
  deleteTimeLogController,
} from "../controllers/time-log.controller";

const timeLogRoutes = Router();

timeLogRoutes.post(
  "/task/:taskId/workspace/:workspaceId/create",
  logTimeController
);

timeLogRoutes.get(
  "/task/:taskId/workspace/:workspaceId/all",
  getTaskTimeLogsController
);

timeLogRoutes.get(
  "/project/:projectId/workspace/:workspaceId/all",
  getProjectTimeLogsController
);

timeLogRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteTimeLogController
);

export default timeLogRoutes;
