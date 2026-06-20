import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createSprintSchema,
  updateSprintSchema,
  sprintIdSchema,
} from "../validation/sprint.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createSprintService,
  updateSprintService,
  getProjectSprintsService,
  getSprintByIdService,
  deleteSprintService,
} from "../services/sprint.service";
import { HTTPSTATUS } from "../config/http.config";

export const createSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createSprintSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const { sprint } = await createSprintService(
      workspaceId,
      projectId,
      userId,
      body
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Sprint created successfully",
      sprint,
    });
  }
);

export const updateSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = updateSprintSchema.parse(req.body);
    const sprintId = sprintIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const { sprint } = await updateSprintService(
      workspaceId,
      projectId,
      sprintId,
      userId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint updated successfully",
      sprint,
    });
  }
);

export const getProjectSprintsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { sprints } = await getProjectSprintsService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprints fetched successfully",
      sprints,
    });
  }
);

export const getSprintByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const sprintId = sprintIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getSprintByIdService(
      workspaceId,
      projectId,
      sprintId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint details fetched successfully",
      ...result,
    });
  }
);

export const deleteSprintController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const sprintId = sprintIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    await deleteSprintService(workspaceId, sprintId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Sprint deleted successfully",
    });
  }
);
