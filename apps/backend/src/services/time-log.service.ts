import TimeLogModel from "../models/time-log.model";
import TaskModel from "../models/task.model";
import MemberModel from "../models/member.model";
import { Roles } from "../enums/role.enum";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";

export const logTimeService = async (
  workspaceId: string,
  taskId: string,
  userId: string,
  body: {
    durationMinutes: number;
    description?: string;
    loggedAt?: string;
  }
) => {
  const task = await TaskModel.findById(taskId);
  if (!task || task.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Task not found or does not belong to this workspace.");
  }

  const timeLog = new TimeLogModel({
    task: taskId,
    user: userId,
    workspace: workspaceId,
    durationMinutes: body.durationMinutes,
    description: body.description || null,
    loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
  });

  await timeLog.save();
  const populatedLog = await TimeLogModel.findById(timeLog._id).populate("user", "_id name profilePicture");
  return { timeLog: populatedLog };
};

export const getTaskTimeLogsService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findById(taskId);
  if (!task || task.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Task not found or does not belong to this workspace.");
  }

  const timeLogs = await TimeLogModel.find({
    task: taskId,
    workspace: workspaceId,
  })
    .sort({ loggedAt: -1 })
    .populate("user", "_id name profilePicture");

  const totalMinutes = timeLogs.reduce((sum, log) => sum + log.durationMinutes, 0);

  return { timeLogs, totalMinutes };
};

export const getProjectTimeLogsService = async (
  workspaceId: string,
  projectId: string
) => {
  // Find all tasks in the project
  const taskIds = await TaskModel.find({ project: projectId, workspace: workspaceId }).select("_id");
  const taskIdsArray = taskIds.map((t) => t._id);

  const timeLogs = await TimeLogModel.find({
    task: { $in: taskIdsArray },
    workspace: workspaceId,
  })
    .sort({ loggedAt: -1 })
    .populate("user", "_id name profilePicture")
    .populate("task", "_id title taskCode");

  const totalMinutes = timeLogs.reduce((sum, log) => sum + log.durationMinutes, 0);

  return { timeLogs, totalMinutes };
};

export const deleteTimeLogService = async (
  workspaceId: string,
  timeLogId: string,
  userId: string
) => {
  const timeLog = await TimeLogModel.findOne({
    _id: timeLogId,
    workspace: workspaceId,
  });

  if (!timeLog) {
    throw new NotFoundException("Time log not found.");
  }

  const member = await MemberModel.findOne({ userId, workspaceId }).populate("role");
  const roleName = (member?.role as any)?.name;
  const isAuthorized =
    timeLog.user.toString() === userId.toString() ||
    roleName === Roles.OWNER ||
    roleName === Roles.ADMIN;

  if (!isAuthorized) {
    throw new UnauthorizedException("You are not authorized to delete this time log.");
  }

  await TimeLogModel.findByIdAndDelete(timeLogId);
  return;
};
