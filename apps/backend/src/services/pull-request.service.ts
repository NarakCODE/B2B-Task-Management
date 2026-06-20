import PullRequestModel from "../models/pull-request.model"
import TaskModel from "../models/task.model"
import IntegrationModel from "../models/integration.model"
import { NotFoundException } from "../utils/appError"
import { TaskStatusEnum } from "../enums/task.enum"
import { logActivity } from "./activity-log.service"
import { triggerSlackNotification } from "./integration.service"

const TASK_CODE_REGEX = /task-[a-f0-9]{3}/gi
const BRANCH_TASK_REGEX = /task-[a-f0-9]{3}/i

export const parseTaskCodes = (text: string): string[] => {
  const matches = text.match(TASK_CODE_REGEX)
  if (!matches) return []
  return Array.from(new Set(matches.map((m) => m.toLowerCase())))
}

export const generateBranchName = (taskCode: string, title: string): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60)
  return `feature/${taskCode}-${slug}`
}

export const upsertPullRequestService = async (
  workspaceId: string,
  integrationId: string,
  prData: {
    prNumber: number
    title: string
    url: string
    branch: string
    author: string
    authorAvatar?: string | null
    status: "OPEN" | "CLOSED" | "MERGED"
    mergedAt?: string | null
    mergedBy?: string | null
    repository: string
    description?: string
  },
) => {
  const existing = await PullRequestModel.findOne({
    workspace: workspaceId,
    prNumber: prData.prNumber,
    repository: prData.repository,
  })

  // Parse task codes from all sources
  const taskCodesFromBranch = parseTaskCodes(prData.branch)
  const taskCodesFromTitle = parseTaskCodes(prData.title)
  const taskCodesFromDesc = parseTaskCodes(prData.description || "")
  const allTaskCodes = Array.from(
    new Set([...taskCodesFromBranch, ...taskCodesFromTitle, ...taskCodesFromDesc]),
  )

  // Find matching tasks
  const tasks =
    allTaskCodes.length > 0
      ? await TaskModel.find({ workspace: workspaceId, taskCode: { $in: allTaskCodes } })
      : []

  const taskIds = tasks.map((t) => t._id)

  if (existing) {
    existing.title = prData.title
    existing.url = prData.url
    existing.branch = prData.branch
    existing.author = prData.author
    existing.status = prData.status
    if (prData.authorAvatar) existing.authorAvatar = prData.authorAvatar
    if (prData.mergedAt) existing.mergedAt = new Date(prData.mergedAt)
    if (prData.mergedBy) existing.mergedBy = prData.mergedBy
    if (taskIds.length > 0) existing.tasks = taskIds
    await existing.save()
  } else {
    const pr = new PullRequestModel({
      prNumber: prData.prNumber,
      title: prData.title,
      url: prData.url,
      branch: prData.branch,
      author: prData.author,
      authorAvatar: prData.authorAvatar || null,
      status: prData.status,
      mergedAt: prData.mergedAt ? new Date(prData.mergedAt) : null,
      mergedBy: prData.mergedBy || null,
      workspace: workspaceId,
      integration: integrationId,
      repository: prData.repository,
      tasks: taskIds,
    })
    await pr.save()
  }

  return { tasks, taskCodes: allTaskCodes }
}

export const getPullRequestsByTaskService = async (workspaceId: string, taskId: string) => {
  const prs = await PullRequestModel.find({
    workspace: workspaceId,
    tasks: taskId,
  }).sort({ createdAt: -1 })

  return { pullRequests: prs }
}

export const getPullRequestsByProjectService = async (
  workspaceId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const totalCount = await PullRequestModel.countDocuments({
    workspace: workspaceId,
    project: projectId,
  })
  const skip = (pageNumber - 1) * pageSize

  const pullRequests = await PullRequestModel.find({ workspace: workspaceId, project: projectId })
    .skip(skip)
    .limit(pageSize)
    .populate("tasks", "_id title taskCode status")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { pullRequests, totalCount, totalPages, skip }
}

export const getWorkspacePullRequestsService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number,
  status?: string,
) => {
  const query: Record<string, any> = { workspace: workspaceId }
  if (status) query.status = status

  const totalCount = await PullRequestModel.countDocuments(query)
  const skip = (pageNumber - 1) * pageSize

  const pullRequests = await PullRequestModel.find(query)
    .skip(skip)
    .limit(pageSize)
    .populate("tasks", "_id title taskCode status")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { pullRequests, totalCount, totalPages, skip }
}

export const handlePullRequestWebhookService = async (workspaceId: string, payload: any) => {
  const integration = await IntegrationModel.findOne({
    workspace: workspaceId,
    provider: "GITHUB",
    isActive: true,
  })

  if (!integration) {
    return { success: false, message: "No active GitHub integration" }
  }

  const action = payload.action
  const pr = payload.pull_request

  if (!pr) {
    return { success: false, message: "No pull request data in payload" }
  }

  const prStatus: "OPEN" | "CLOSED" | "MERGED" = pr.merged_at
    ? "MERGED"
    : pr.state === "closed"
      ? "CLOSED"
      : "OPEN"

  const repository = payload.repository?.full_name || "unknown"

  const { tasks, taskCodes } = await upsertPullRequestService(
    workspaceId,
    integration._id.toString(),
    {
      prNumber: pr.number,
      title: pr.title,
      url: pr.html_url,
      branch: pr.head?.ref || "",
      author: pr.user?.login || "unknown",
      authorAvatar: pr.user?.avatar_url || null,
      status: prStatus,
      mergedAt: pr.merged_at || null,
      mergedBy: pr.merged_by?.login || null,
      repository,
      description: pr.body || "",
    },
  )

  // Auto-transition tasks based on PR action
  for (const task of tasks) {
    if (
      (action === "opened" && task.status === TaskStatusEnum.TODO) ||
      task.status === TaskStatusEnum.BACKLOG
    ) {
      task.status = TaskStatusEnum.IN_PROGRESS
      await task.save()

      await logActivity({
        workspaceId,
        taskId: task._id.toString(),
        projectId: task.project?.toString() || null,
        sprintId: task.sprint?.toString() || null,
        userId: task.createdBy.toString(),
        actionType: "UPDATE_TASK_STATUS",
        description: `task moved to IN_PROGRESS via PR #${pr.number}`,
        metadata: {
          oldStatus: TaskStatusEnum.TODO,
          newStatus: TaskStatusEnum.IN_PROGRESS,
          prNumber: pr.number,
        },
      })
    }

    if (prStatus === "MERGED") {
      task.status = TaskStatusEnum.DONE
      await task.save()

      await logActivity({
        workspaceId,
        taskId: task._id.toString(),
        projectId: task.project?.toString() || null,
        sprintId: task.sprint?.toString() || null,
        userId: task.createdBy.toString(),
        actionType: "UPDATE_TASK_STATUS",
        description: `task moved to DONE via merged PR #${pr.number}`,
        metadata: {
          oldStatus: TaskStatusEnum.IN_REVIEW,
          newStatus: TaskStatusEnum.DONE,
          prNumber: pr.number,
        },
      })
    }

    // Slack notification
    const slackMessage = `🔀 *PR ${action === "opened" ? "Opened" : prStatus === "MERGED" ? "Merged" : "Updated"}*\n*PR*: <${pr.html_url}|#${pr.number} ${pr.title}>\n*Repository*: ${repository}\n*Author*: ${pr.user?.login}\n*Linked Tasks*: ${taskCodes.join(", ") || "none"}`
    await triggerSlackNotification(workspaceId, slackMessage)
  }

  return { success: true, tasksLinked: tasks.length, taskCodes }
}
