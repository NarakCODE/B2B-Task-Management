import { Router } from "express";
import {
  getWorkspaceTimelineController,
  getProjectTimelineController,
  getSprintTimelineController,
  getTaskTimelineController,
} from "../controllers/timeline.controller";

const timelineRoutes = Router();

timelineRoutes.get(
  "/workspace/:workspaceId",
  getWorkspaceTimelineController
);

timelineRoutes.get(
  "/project/:projectId/workspace/:workspaceId",
  getProjectTimelineController
);

timelineRoutes.get(
  "/sprint/:sprintId/workspace/:workspaceId",
  getSprintTimelineController
);

timelineRoutes.get(
  "/task/:taskId/workspace/:workspaceId",
  getTaskTimelineController
);

export default timelineRoutes;
