import ReleaseModel from "../models/release.model"
import TaskModel from "../models/task.model"
import ProjectModel from "../models/project.model"
import mongoose from "mongoose"
import { NotFoundException } from "../utils/appError"

export const createReleaseService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    version: string
    name: string
    description?: string
    status?: string
    targetDate?: string | null
    releasedAt?: string | null
  },
) => {
  const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
  if (!project) {
    throw new NotFoundException("Project not found in this workspace")
  }

  const release = new ReleaseModel({
    version: body.version,
    name: body.name,
    description: body.description || null,
    status: body.status || "PLANNED",
    targetDate: body.targetDate ? new Date(body.targetDate) : null,
    releasedAt: body.releasedAt ? new Date(body.releasedAt) : null,
    project: projectId,
    workspace: workspaceId,
    createdBy: userId,
  })
  await release.save()

  return { release }
}

export const getReleasesByProjectService = async (
  workspaceId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
  if (!project) {
    throw new NotFoundException("Project not found in this workspace")
  }

  const totalCount = await ReleaseModel.countDocuments({
    workspace: workspaceId,
    project: projectId,
  })
  const skip = (pageNumber - 1) * pageSize

  const releases = await ReleaseModel.find({ workspace: workspaceId, project: projectId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { releases, totalCount, totalPages, skip }
}

export const getReleaseByIdService = async (workspaceId: string, releaseId: string) => {
  const release = await ReleaseModel.findOne({ _id: releaseId, workspace: workspaceId }).populate(
    "createdBy",
    "_id name profilePicture -password",
  )

  if (!release) {
    throw new NotFoundException("Release not found")
  }

  return { release }
}

export const updateReleaseService = async (
  workspaceId: string,
  releaseId: string,
  body: {
    version?: string
    name?: string
    description?: string
    status?: string
    targetDate?: string | null
    releasedAt?: string | null
  },
) => {
  const release = await ReleaseModel.findOne({ _id: releaseId, workspace: workspaceId })
  if (!release) {
    throw new NotFoundException("Release not found")
  }

  if (body.version !== undefined) release.version = body.version
  if (body.name !== undefined) release.name = body.name
  if (body.description !== undefined) release.description = body.description
  if (body.status !== undefined) release.status = body.status as any
  if (body.targetDate !== undefined)
    release.targetDate = body.targetDate ? new Date(body.targetDate) : null
  if (body.releasedAt !== undefined)
    release.releasedAt = body.releasedAt ? new Date(body.releasedAt) : null

  await release.save()
  return { release }
}

export const deleteReleaseService = async (workspaceId: string, releaseId: string) => {
  const release = await ReleaseModel.findOneAndDelete({ _id: releaseId, workspace: workspaceId })
  if (!release) {
    throw new NotFoundException("Release not found")
  }

  await TaskModel.updateMany(
    { workspace: workspaceId, release: releaseId },
    { $unset: { release: "" } },
  )

  return
}

export const getReleaseTasksService = async (
  workspaceId: string,
  releaseId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const release = await ReleaseModel.findOne({ _id: releaseId, workspace: workspaceId })
  if (!release) {
    throw new NotFoundException("Release not found")
  }

  const totalCount = await TaskModel.countDocuments({ workspace: workspaceId, release: releaseId })
  const skip = (pageNumber - 1) * pageSize

  const tasks = await TaskModel.find({ workspace: workspaceId, release: releaseId })
    .skip(skip)
    .limit(pageSize)
    .populate("assignedTo", "_id name profilePicture -password")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { tasks, totalCount, totalPages, skip }
}

export const generateReleaseNotesService = async (workspaceId: string, releaseId: string) => {
  const release = await ReleaseModel.findOne({ _id: releaseId, workspace: workspaceId })
  if (!release) {
    throw new NotFoundException("Release not found")
  }

  const completedTasks = await TaskModel.find({
    workspace: workspaceId,
    release: releaseId,
    status: "DONE",
  })
    .populate("assignedTo", "_id name profilePicture -password")
    .sort({ updatedAt: -1 })

  const grouped = completedTasks.reduce(
    (acc, task) => {
      const type = task.taskType || "OTHER"
      if (!acc[type]) acc[type] = []
      acc[type].push(task)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return {
    release: { version: release.version, name: release.name, releasedAt: release.releasedAt },
    summary: { totalCompleted: completedTasks.length },
    grouped,
    tasks: completedTasks,
  }
}

export const getReleaseAnalyticsService = async (workspaceId: string, releaseId: string) => {
  const release = await ReleaseModel.findOne({ _id: releaseId, workspace: workspaceId })
  if (!release) {
    throw new NotFoundException("Release not found")
  }

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        release: new mongoose.Types.ObjectId(releaseId),
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

  return {
    analytics: {
      totalTasks: _analytics.totalTasks[0]?.count || 0,
      completedTasks: _analytics.completedTasks[0]?.count || 0,
      overdueTasks: _analytics.overdueTasks[0]?.count || 0,
      percentComplete:
        (_analytics.totalTasks[0]?.count || 0) > 0
          ? Math.round(
              ((_analytics.completedTasks[0]?.count || 0) /
                (_analytics.totalTasks[0]?.count || 0)) *
                100,
            )
          : 0,
    },
    tasksByStatus: _analytics.tasksByStatus || [],
  }
}
