import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  logTimeSchema,
  timeLogIdSchema,
} from "../validation/time-log.validation";
import { taskIdSchema } from "../validation/task.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  logTimeService,
  getTaskTimeLogsService,
  getProjectTimeLogsService,
  deleteTimeLogService,
} from "../services/time-log.service";
import { HTTPSTATUS } from "../config/http.config";

export const logTimeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = logTimeSchema.parse(req.body);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]); // All workspace members can log time

    const { timeLog } = await logTimeService(
      workspaceId,
      taskId,
      userId,
      body
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Time logged successfully",
      timeLog,
    });
  }
);

export const getTaskTimeLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getTaskTimeLogsService(workspaceId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task time logs fetched successfully",
      ...result,
    });
  }
);

export const getProjectTimeLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getProjectTimeLogsService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project time logs fetched successfully",
      ...result,
    });
  }
);

export const deleteTimeLogController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const timeLogId = timeLogIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    await deleteTimeLogService(workspaceId, timeLogId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Time log deleted successfully",
    });
  }
);
