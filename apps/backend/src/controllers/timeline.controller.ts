import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { sprintIdSchema } from "../validation/sprint.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  getWorkspaceTimelineService,
  getProjectTimelineService,
  getSprintTimelineService,
} from "../services/activity-log.service";
import { HTTPSTATUS } from "../config/http.config";

export const getWorkspaceTimelineController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getWorkspaceTimelineService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace timeline fetched successfully",
      ...result,
    });
  }
);

export const getProjectTimelineController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getProjectTimelineService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project timeline fetched successfully",
      ...result,
    });
  }
);

export const getSprintTimelineController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const sprintId = sprintIdSchema.parse(req.params.sprintId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getSprintTimelineService(workspaceId, sprintId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint timeline fetched successfully",
      ...result,
    });
  }
);
