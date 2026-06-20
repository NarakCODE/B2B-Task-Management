import CommentModel from "../models/comment.model";
import TaskModel from "../models/task.model";
import MemberModel from "../models/member.model";
import { Roles } from "../enums/role.enum";
import { logActivity } from "./activity-log.service";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";

export const createCommentService = async (
  workspaceId: string,
  taskId: string,
  userId: string,
  content: string
) => {
  const task = await TaskModel.findById(taskId);
  if (!task || task.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Task not found or does not belong to this workspace.");
  }

  const comment = new CommentModel({
    content,
    task: taskId,
    user: userId,
    workspace: workspaceId,
  });

  await comment.save();

  // Log activity
  await logActivity({
    workspaceId,
    projectId: task.project?.toString() || null,
    sprintId: task.sprint?.toString() || null,
    taskId,
    userId,
    actionType: "ADD_COMMENT",
    description: `commented on task "${task.title}"`,
    metadata: { commentId: comment._id, content },
  });

  const populatedComment = await CommentModel.findById(comment._id).populate("user", "_id name profilePicture");
  return { comment: populatedComment };
};

export const getTaskCommentsService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findById(taskId);
  if (!task || task.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Task not found or does not belong to this workspace.");
  }

  const comments = await CommentModel.find({
    task: taskId,
    workspace: workspaceId,
  })
    .sort({ createdAt: 1 })
    .populate("user", "_id name profilePicture");

  return { comments };
};

export const updateCommentService = async (
  workspaceId: string,
  commentId: string,
  userId: string,
  content: string
) => {
  const comment = await CommentModel.findOne({
    _id: commentId,
    workspace: workspaceId,
  });

  if (!comment) {
    throw new NotFoundException("Comment not found.");
  }

  if (comment.user.toString() !== userId.toString()) {
    throw new UnauthorizedException("You are not authorized to edit this comment.");
  }

  comment.content = content;
  await comment.save();

  const populatedComment = await CommentModel.findById(comment._id).populate("user", "_id name profilePicture");
  return { comment: populatedComment };
};

export const deleteCommentService = async (
  workspaceId: string,
  commentId: string,
  userId: string
) => {
  const comment = await CommentModel.findOne({
    _id: commentId,
    workspace: workspaceId,
  });

  if (!comment) {
    throw new NotFoundException("Comment not found.");
  }

  // Get user role in workspace to check if admin/owner
  const member = await MemberModel.findOne({ userId, workspaceId }).populate("role");
  const roleName = (member?.role as any)?.name;
  const isAuthorized =
    comment.user.toString() === userId.toString() ||
    roleName === Roles.OWNER ||
    roleName === Roles.ADMIN;

  if (!isAuthorized) {
    throw new UnauthorizedException("You are not authorized to delete this comment.");
  }

  await CommentModel.findByIdAndDelete(commentId);
  return;
};
