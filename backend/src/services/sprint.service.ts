import SprintModel from "../models/sprint.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import { logActivity } from "./activity-log.service";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createSprintService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
  }
) => {
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project not found or does not belong to this workspace.");
  }

  const sprint = new SprintModel({
    name: body.name,
    description: body.description || null,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    project: projectId,
    workspace: workspaceId,
    createdBy: userId,
  });

  await sprint.save();

  await logActivity({
    workspaceId,
    projectId,
    sprintId: sprint._id.toString(),
    userId,
    actionType: "CREATE_SPRINT",
    description: `created sprint "${body.name}"`,
  });

  return { sprint };
};

export const updateSprintService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string,
  userId: string,
  body: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: "PLANNED" | "ACTIVE" | "COMPLETED";
  }
) => {
  const sprint = await SprintModel.findOne({
    _id: sprintId,
    project: projectId,
    workspace: workspaceId,
  });

  if (!sprint) {
    throw new NotFoundException("Sprint not found.");
  }

  const updates: any = { ...body };
  if (body.startDate) updates.startDate = new Date(body.startDate);
  if (body.endDate) updates.endDate = new Date(body.endDate);

  // If status is transitioning to ACTIVE, log START_SPRINT
  if (body.status === "ACTIVE" && sprint.status !== "ACTIVE") {
    await logActivity({
      workspaceId,
      projectId,
      sprintId,
      userId,
      actionType: "START_SPRINT",
      description: `started sprint "${sprint.name}"`,
    });
  }

  // If status is transitioning to COMPLETED, move unfinished tasks to backlog (sprint: null)
  if (body.status === "COMPLETED" && sprint.status !== "COMPLETED") {
    await logActivity({
      workspaceId,
      projectId,
      sprintId,
      userId,
      actionType: "COMPLETE_SPRINT",
      description: `completed sprint "${sprint.name}"`,
    });

    await TaskModel.updateMany(
      {
        sprint: sprintId,
        status: { $ne: TaskStatusEnum.DONE },
      },
      {
        sprint: null,
      }
    );
  }

  const updatedSprint = await SprintModel.findByIdAndUpdate(
    sprintId,
    updates,
    { new: true }
  );

  if (!updatedSprint) {
    throw new BadRequestException("Failed to update sprint.");
  }

  return { sprint: updatedSprint };
};

export const getProjectSprintsService = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project not found or does not belong to this workspace.");
  }

  const sprints = await SprintModel.find({
    project: projectId,
    workspace: workspaceId,
  }).sort({ startDate: -1 });

  return { sprints };
};

export const getSprintByIdService = async (
  workspaceId: string,
  projectId: string,
  sprintId: string
) => {
  const sprint = await SprintModel.findOne({
    _id: sprintId,
    project: projectId,
    workspace: workspaceId,
  });

  if (!sprint) {
    throw new NotFoundException("Sprint not found.");
  }

  // Get sprint tasks and aggregate stats
  const tasks = await TaskModel.find({ sprint: sprintId }).populate("assignedTo", "_id name profilePicture");
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatusEnum.DONE).length;
  
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedStoryPoints = tasks
    .filter(t => t.status === TaskStatusEnum.DONE)
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return {
    sprint,
    tasks,
    stats: {
      totalTasks,
      completedTasks,
      totalStoryPoints,
      completedStoryPoints,
    }
  };
};

export const deleteSprintService = async (
  workspaceId: string,
  sprintId: string
) => {
  const sprint = await SprintModel.findOneAndDelete({
    _id: sprintId,
    workspace: workspaceId,
  });

  if (!sprint) {
    throw new NotFoundException("Sprint not found.");
  }

  // Nullify sprint references on tasks
  await TaskModel.updateMany({ sprint: sprintId }, { sprint: null });

  return;
};
