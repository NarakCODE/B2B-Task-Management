import mongoose from "mongoose"
import ActivityLogModel from "../models/activity-log.model"
import TaskModel from "../models/task.model"
import SprintModel from "../models/sprint.model"
import PullRequestModel from "../models/pull-request.model"
import DeploymentModel from "../models/deployment.model"

export const getCycleTimeService = async (
  workspaceId: string,
  filters: {
    projectId?: string
    taskId?: string
    assigneeId?: string
    sprintId?: string
    startDate?: string
    endDate?: string
  },
) => {
  const match: Record<string, any> = { workspace: new mongoose.Types.ObjectId(workspaceId) }

  if (filters.projectId) match.project = new mongoose.Types.ObjectId(filters.projectId)
  if (filters.taskId) match.task = new mongoose.Types.ObjectId(filters.taskId)
  if (filters.sprintId) match.sprint = new mongoose.Types.ObjectId(filters.sprintId)

  // Get lead time: time from task creation to done
  const leadTimeData = await ActivityLogModel.aggregate([
    { $match: { ...match, actionType: { $in: ["CREATE_TASK", "UPDATE_TASK_STATUS"] } } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$task",
        created: {
          $first: { $cond: [{ $eq: ["$actionType", "CREATE_TASK"] }, "$createdAt", null] },
        },
        doneAt: {
          $first: {
            $cond: [
              {
                $and: [
                  { $eq: ["$actionType", "UPDATE_TASK_STATUS"] },
                  { $eq: ["$metadata.newStatus", "DONE"] },
                ],
              },
              "$createdAt",
              null,
            ],
          },
        },
        reopened: { $sum: { $cond: [{ $eq: ["$actionType", "UPDATE_TASK_STATUS"] }, 1, 0] } },
      },
    },
    {
      $match: {
        created: { $ne: null },
      },
    },
    {
      $project: {
        _id: 1,
        leadTimeHours: {
          $cond: {
            if: { $ne: ["$doneAt", null] },
            then: { $divide: [{ $subtract: ["$doneAt", "$created"] }, 3600000] },
            else: null,
          },
        },
        reopened: 1,
      },
    },
  ])

  // Calculate averages
  const completedItems = leadTimeData.filter((d: any) => d.leadTimeHours !== null)
  const avgLeadTimeHours =
    completedItems.length > 0
      ? completedItems.reduce((sum: number, d: any) => sum + d.leadTimeHours, 0) /
        completedItems.length
      : 0

  return {
    metrics: {
      totalTasksTracked: leadTimeData.length,
      completedTasks: completedItems.length,
      averageLeadTimeHours: Math.round(avgLeadTimeHours * 100) / 100,
      averageLeadTimeDays: Math.round((avgLeadTimeHours / 24) * 100) / 100,
      totalReopened: leadTimeData.reduce((sum: number, d: any) => sum + (d.reopened || 0), 0),
    },
    taskDetails: leadTimeData.filter((d: any) => d.leadTimeHours !== null).slice(0, 100),
  }
}

export const getSprintHealthService = async (workspaceId: string, sprintId: string) => {
  const sprint = await SprintModel.findById(sprintId)
  if (!sprint) {
    throw new Error("Sprint not found")
  }

  const tasks = await TaskModel.find({ workspace: workspaceId, sprint: sprintId })

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "DONE").length
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const completedStoryPoints = tasks
    .filter((t) => t.status === "DONE")
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

  // Scope changes - tasks added after sprint started
  const sprintStartLogs = await ActivityLogModel.findOne({
    workspace: workspaceId,
    sprint: sprintId,
    actionType: "START_SPRINT",
  }).sort({ createdAt: 1 })

  const sprintStartDate = sprintStartLogs?.createdAt || sprint.startDate
  const tasksAddedAfterStart = await TaskModel.countDocuments({
    workspace: workspaceId,
    sprint: sprintId,
    createdAt: { $gt: sprintStartDate },
  })

  // Carryover - tasks that existed before this sprint
  const tasksCreatedBeforeSprint = await TaskModel.countDocuments({
    workspace: workspaceId,
    sprint: sprintId,
    createdAt: { $lt: sprint.startDate },
  })

  // Burndown data
  const statusChanges = await ActivityLogModel.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        sprint: new mongoose.Types.ObjectId(sprintId),
        actionType: "UPDATE_TASK_STATUS",
        "metadata.newStatus": "DONE",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        storyPoints: { $sum: { $ifNull: ["$metadata.storyPoints", 0] } },
      },
    },
    { $sort: { _id: 1 as const } },
  ])

  return {
    sprint: {
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
    },
    health: {
      totalTasks,
      completedTasks,
      completionRatio: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalStoryPoints,
      completedStoryPoints,
      storyPointCompletionRatio:
        totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
    },
    scopeChanges: {
      tasksAddedAfterStart,
      tasksCreatedBeforeSprint,
      carryoverTasks: tasksCreatedBeforeSprint,
    },
    burndown: {
      dates: statusChanges.map((d: any) => d._id),
      completionCounts: statusChanges.map((d: any) => d.count),
    },
  }
}

export const getWorkspaceVelocityService = async (workspaceId: string, sprintCount: number = 5) => {
  const sprints = await SprintModel.find({ workspace: workspaceId })
    .sort({ endDate: -1 })
    .limit(sprintCount)

  const velocityData = await Promise.all(
    sprints.map(async (sprint) => {
      const tasks = await TaskModel.find({ workspace: workspaceId, sprint: sprint._id })
      const completedTasks = tasks.filter((t) => t.status === "DONE")
      const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
      const completedStoryPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)

      return {
        sprintId: sprint._id,
        sprintName: sprint.name,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        totalStoryPoints,
        completedStoryPoints,
        completionRatio:
          tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      }
    }),
  )

  const avgVelocity =
    velocityData.length > 0
      ? Math.round(
          velocityData.reduce((sum, s) => sum + s.completedStoryPoints, 0) / velocityData.length,
        )
      : 0

  return {
    velocity: velocityData,
    averageVelocity: avgVelocity,
    sprintCount: velocityData.length,
  }
}

export const getEngineeringDashboardService = async (workspaceId: string, projectId?: string) => {
  const taskMatch: Record<string, any> = { workspace: workspaceId }
  if (projectId) taskMatch.project = projectId

  // Active PRs
  const activePRs = await PullRequestModel.countDocuments({
    workspace: workspaceId,
    ...(projectId ? { project: projectId } : {}),
    status: "OPEN",
  })

  // Deployments
  const recentDeployments = await DeploymentModel.find({
    workspace: workspaceId,
    ...(projectId ? { project: projectId } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(5)

  // Blocked tasks
  const blockedTasks = await TaskModel.countDocuments({
    ...taskMatch,
    status: "IN_REVIEW",
  })

  // Overdue reviews (tasks in review past due date)
  const overdueReview = await TaskModel.countDocuments({
    ...taskMatch,
    status: "IN_REVIEW",
    dueDate: { $lt: new Date() },
  })

  // Throughput (tasks completed in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const totalTasks = await TaskModel.countDocuments(taskMatch)
  const completedLast30Days = await TaskModel.countDocuments({
    ...taskMatch,
    status: "DONE",
    updatedAt: { $gte: thirtyDaysAgo },
  })

  return {
    throughput: {
      totalTasks,
      completedLast30Days,
      completionRate: totalTasks > 0 ? Math.round((completedLast30Days / totalTasks) * 100) : 0,
    },
    activePRs,
    blockedTasks,
    overdueReview,
    recentDeployments,
    projectFilter: projectId || null,
  }
}
