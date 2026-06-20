import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} from "../validation/comment.validation";
import { taskIdSchema } from "../validation/task.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createCommentService,
  getTaskCommentsService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service";
import { HTTPSTATUS } from "../config/http.config";

export const createCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createCommentSchema.parse(req.body);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]); // All workspace members can comment

    const { comment } = await createCommentService(
      workspaceId,
      taskId,
      userId,
      body.content
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Comment added successfully",
      comment,
    });
  }
);

export const getTaskCommentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { comments } = await getTaskCommentsService(workspaceId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comments fetched successfully",
      comments,
    });
  }
);

export const updateCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = updateCommentSchema.parse(req.body);
    const commentId = commentIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { comment } = await updateCommentService(
      workspaceId,
      commentId,
      userId,
      body.content
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment updated successfully",
      comment,
    });
  }
);

export const deleteCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const commentId = commentIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    await deleteCommentService(workspaceId, commentId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment deleted successfully",
    });
  }
);
