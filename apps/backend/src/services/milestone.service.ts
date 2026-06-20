import MilestoneModel from "../models/milestone.model"
import TaskModel from "../models/task.model"
import EpicModel from "../models/epic.model"
import ProjectModel from "../models/project.model"
import mongoose from "mongoose"
import { NotFoundException } from "../utils/appError"

export const createMilestoneService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    name: string
    description?: string
    dueDate?: string | null
    status?: string
  },
) => {
  const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
  if (!project) {
    throw new NotFoundException("Project not found in this workspace")
  }

  const milestone = new MilestoneModel({
    name: body.name,
    description: body.description || null,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    status: body.status || "OPEN",
    project: projectId,
    workspace: workspaceId,
    createdBy: userId,
  })
  await milestone.save()

  return { milestone }
}

export const getMilestonesByProjectService = async (
  workspaceId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
  if (!project) {
    throw new NotFoundException("Project not found in this workspace")
  }

  const totalCount = await MilestoneModel.countDocuments({
    workspace: workspaceId,
    project: projectId,
  })
  const skip = (pageNumber - 1) * pageSize

  const milestones = await MilestoneModel.find({ workspace: workspaceId, project: projectId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { milestones, totalCount, totalPages, skip }
}

export const getMilestoneByIdService = async (workspaceId: string, milestoneId: string) => {
  const milestone = await MilestoneModel.findOne({
    _id: milestoneId,
    workspace: workspaceId,
  }).populate("createdBy", "_id name profilePicture -password")

  if (!milestone) {
    throw new NotFoundException("Milestone not found")
  }

  return { milestone }
}

export const updateMilestoneService = async (
  workspaceId: string,
  milestoneId: string,
  body: {
    name?: string
    description?: string
    dueDate?: string | null
    status?: string
  },
) => {
  const milestone = await MilestoneModel.findOne({ _id: milestoneId, workspace: workspaceId })
  if (!milestone) {
    throw new NotFoundException("Milestone not found")
  }

  if (body.name !== undefined) milestone.name = body.name
  if (body.description !== undefined) milestone.description = body.description
  if (body.dueDate !== undefined) milestone.dueDate = body.dueDate ? new Date(body.dueDate) : null
  if (body.status !== undefined) milestone.status = body.status as any

  await milestone.save()
  return { milestone }
}

export const deleteMilestoneService = async (workspaceId: string, milestoneId: string) => {
  const milestone = await MilestoneModel.findOneAndDelete({
    _id: milestoneId,
    workspace: workspaceId,
  })
  if (!milestone) {
    throw new NotFoundException("Milestone not found")
  }

  await TaskModel.updateMany(
    { workspace: workspaceId, milestone: milestoneId },
    { $unset: { milestone: "" } },
  )
  await EpicModel.updateMany({ workspace: workspaceId }, { $unset: { milestone: "" } })

  return
}

export const getMilestoneProgressService = async (workspaceId: string, milestoneId: string) => {
  const milestone = await MilestoneModel.findOne({ _id: milestoneId, workspace: workspaceId })
  if (!milestone) {
    throw new NotFoundException("Milestone not found")
  }

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        milestone: new mongoose.Types.ObjectId(milestoneId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        completedTasks: [{ $match: { status: "DONE" } }, { $count: "count" }],
        overdueTasks: [
          { $match: { dueDate: { $lt: new Date() }, status: { $ne: "DONE" } } },
          { $count: "count" },
        ],
        tasksByStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    },
  ])

  const _analytics = taskAnalytics[0]
  const totalTasks = _analytics.totalTasks[0]?.count || 0
  const completedTasks = _analytics.completedTasks[0]?.count || 0

  return {
    progress: {
      totalTasks,
      completedTasks,
      percentComplete: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      overdueTasks: _analytics.overdueTasks[0]?.count || 0,
      isOverdue: milestone.dueDate ? new Date() > milestone.dueDate : false,
    },
    tasksByStatus: _analytics.tasksByStatus || [],
  }
}

export const addMilestoneToEpicsService = async (
  workspaceId: string,
  milestoneId: string,
  epicIds: string[],
) => {
  const milestone = await MilestoneModel.findOne({ _id: milestoneId, workspace: workspaceId })
  if (!milestone) {
    throw new NotFoundException("Milestone not found")
  }

  await EpicModel.updateMany(
    { _id: { $in: epicIds }, workspace: workspaceId },
    { $set: { milestone: milestoneId } },
  )

  await TaskModel.updateMany(
    { epic: { $in: epicIds }, workspace: workspaceId },
    { $set: { milestone: milestoneId } },
  )

  return
}
