import { TaskPriorityEnum, TaskStatusEnum, TaskTypeEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import SprintModel from "../models/sprint.model";
import { logActivity } from "./activity-log.service";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
    taskType?: string;
    storyPoints?: number | null;
    sprint?: string | null;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate, taskType, storyPoints, sprint } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }
  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not a member of this workspace.");
    }
  }

  if (sprint) {
    const existingSprint = await SprintModel.findById(sprint);
    if (!existingSprint || existingSprint.project.toString() !== projectId.toString()) {
      throw new NotFoundException("Sprint not found or does not belong to this project.");
    }
  }

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    taskType: taskType || TaskTypeEnum.FEATURE,
    storyPoints: storyPoints !== undefined ? storyPoints : null,
    sprint: sprint || null,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  await logActivity({
    workspaceId,
    projectId,
    sprintId: sprint || null,
    taskId: task._id.toString(),
    userId,
    actionType: "CREATE_TASK",
    description: `created task "${title}"`,
  });

  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
    taskType?: string;
    storyPoints?: number | null;
    sprint?: string | null;
  }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  if (body.sprint) {
    const existingSprint = await SprintModel.findById(body.sprint);
    if (!existingSprint || existingSprint.project.toString() !== projectId.toString()) {
      throw new NotFoundException("Sprint not found or does not belong to this project.");
    }
  }

  // Log activity if status or priority changed
  if (body.status && body.status !== task.status) {
    await logActivity({
      workspaceId,
      projectId,
      sprintId: task.sprint?.toString() || null,
      taskId: task._id.toString(),
      userId,
      actionType: "UPDATE_TASK_STATUS",
      metadata: { oldStatus: task.status, newStatus: body.status },
      description: `changed status of task "${task.title}" to ${body.status}`,
    });
  }

  if (body.priority && body.priority !== task.priority) {
    await logActivity({
      workspaceId,
      projectId,
      sprintId: task.sprint?.toString() || null,
      taskId: task._id.toString(),
      userId,
      actionType: "UPDATE_TASK_PRIORITY",
      metadata: { oldPriority: task.priority, newPriority: body.priority },
      description: `changed priority of task "${task.title}" to ${body.priority}`,
    });
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
    sprint?: string;
    taskType?: string[];
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  if (filters.sprint) {
    if (filters.sprint === "backlog") {
      query.sprint = null;
    } else {
      query.sprint = filters.sprint;
    }
  }

  if (filters.taskType && filters.taskType.length > 0) {
    query.taskType = { $in: filters.taskType };
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name")
      .populate("sprint", "_id name status startDate endDate"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  })
    .populate("assignedTo", "_id name profilePicture -password")
    .populate("sprint", "_id name status startDate endDate");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};
