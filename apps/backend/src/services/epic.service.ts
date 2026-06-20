import EpicModel from "../models/epic.model"
import TaskModel from "../models/task.model"
import ProjectModel from "../models/project.model"
import mongoose from "mongoose"
import { NotFoundException } from "../utils/appError"

export const createEpicService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    name: string
    description?: string
    status?: string
    owner?: string | null
    startDate?: string | null
    targetDate?: string | null
  },
) => {
  const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
  if (!project) {
    throw new NotFoundException("Project not found in this workspace")
  }

  const epic = new EpicModel({
    name: body.name,
    description: body.description || null,
    status: body.status || "OPEN",
    project: projectId,
    workspace: workspaceId,
    owner: body.owner || null,
    startDate: body.startDate ? new Date(body.startDate) : null,
    targetDate: body.targetDate ? new Date(body.targetDate) : null,
  })
  await epic.save()

  return { epic }
}

export const getEpicsByProjectService = async (
  workspaceId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
  if (!project) {
    throw new NotFoundException("Project not found in this workspace")
  }

  const totalCount = await EpicModel.countDocuments({ workspace: workspaceId, project: projectId })
  const skip = (pageNumber - 1) * pageSize

  const epics = await EpicModel.find({ workspace: workspaceId, project: projectId })
    .skip(skip)
    .limit(pageSize)
    .populate("owner", "_id name profilePicture -password")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { epics, totalCount, totalPages, skip }
}

export const getEpicByIdService = async (workspaceId: string, epicId: string) => {
  const epic = await EpicModel.findOne({ _id: epicId, workspace: workspaceId }).populate(
    "owner",
    "_id name profilePicture -password",
  )

  if (!epic) {
    throw new NotFoundException("Epic not found")
  }

  return { epic }
}

export const updateEpicService = async (
  workspaceId: string,
  epicId: string,
  body: {
    name?: string
    description?: string
    status?: string
    owner?: string | null
    startDate?: string | null
    targetDate?: string | null
  },
) => {
  const epic = await EpicModel.findOne({ _id: epicId, workspace: workspaceId })
  if (!epic) {
    throw new NotFoundException("Epic not found")
  }

  if (body.name !== undefined) epic.name = body.name
  if (body.description !== undefined) epic.description = body.description
  if (body.status !== undefined) epic.status = body.status as any
  if (body.owner !== undefined) epic.owner = body.owner as any
  if (body.startDate !== undefined)
    epic.startDate = body.startDate ? new Date(body.startDate) : null
  if (body.targetDate !== undefined)
    epic.targetDate = body.targetDate ? new Date(body.targetDate) : null

  await epic.save()

  return { epic }
}

export const deleteEpicService = async (workspaceId: string, epicId: string) => {
  const epic = await EpicModel.findOneAndDelete({ _id: epicId, workspace: workspaceId })
  if (!epic) {
    throw new NotFoundException("Epic not found")
  }

  await TaskModel.updateMany({ workspace: workspaceId, epic: epicId }, { $unset: { epic: "" } })

  return
}

export const getEpicTasksService = async (
  workspaceId: string,
  epicId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const epic = await EpicModel.findOne({ _id: epicId, workspace: workspaceId })
  if (!epic) {
    throw new NotFoundException("Epic not found")
  }

  const totalCount = await TaskModel.countDocuments({ workspace: workspaceId, epic: epicId })
  const skip = (pageNumber - 1) * pageSize

  const tasks = await TaskModel.find({ workspace: workspaceId, epic: epicId })
    .skip(skip)
    .limit(pageSize)
    .populate("assignedTo", "_id name profilePicture -password")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { tasks, totalCount, totalPages, skip }
}

export const getEpicProgressService = async (workspaceId: string, epicId: string) => {
  const epic = await EpicModel.findOne({ _id: epicId, workspace: workspaceId })
  if (!epic) {
    throw new NotFoundException("Epic not found")
  }

  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        epic: new mongoose.Types.ObjectId(epicId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        completedTasks: [{ $match: { status: "DONE" } }, { $count: "count" }],
        tasksByStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        totalStoryPoints: [{ $group: { _id: null, total: { $sum: "$storyPoints" } } }],
        completedStoryPoints: [
          { $match: { status: "DONE" } },
          { $group: { _id: null, total: { $sum: "$storyPoints" } } },
        ],
      },
    },
  ])

  const _analytics = taskAnalytics[0]
  const totalTasks = _analytics.totalTasks[0]?.count || 0
  const completedTasks = _analytics.completedTasks[0]?.count || 0
  const totalStoryPoints = _analytics.totalStoryPoints[0]?.total || 0
  const completedStoryPoints = _analytics.completedStoryPoints[0]?.total || 0

  return {
    progress: {
      totalTasks,
      completedTasks,
      percentComplete: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalStoryPoints,
      completedStoryPoints,
      storyPointsPercent:
        totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
    },
    tasksByStatus: _analytics.tasksByStatus || [],
  }
}
