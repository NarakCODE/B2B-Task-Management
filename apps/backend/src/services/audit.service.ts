import ActivityLogModel from "../models/activity-log.model"
import { NotFoundException } from "../utils/appError"

export const exportWorkspaceAuditService = async (
  workspaceId: string,
  filters: {
    userId?: string
    projectId?: string
    taskId?: string
    actionType?: string
    startDate?: string
    endDate?: string
  },
  format: "json" | "csv" = "json",
) => {
  const query: Record<string, any> = { workspace: workspaceId }

  if (filters.userId) query.user = filters.userId
  if (filters.projectId) query.project = filters.projectId
  if (filters.taskId) query.task = filters.taskId
  if (filters.actionType) query.actionType = filters.actionType

  if (filters.startDate || filters.endDate) {
    query.createdAt = {}
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate)
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate)
  }

  const logs = await ActivityLogModel.find(query)
    .populate("user", "_id name email")
    .populate("project", "_id name")
    .populate("task", "_id title taskCode")
    .sort({ createdAt: -1 })
    .lean()

  if (format === "csv") {
    const header = "Date,User,Action,Description,Project,Task\n"
    const rows = logs
      .map((log: any) => {
        const date = log.createdAt?.toISOString() || ""
        const user = log.user?.name || log.user?.email || "unknown"
        const action = log.actionType || ""
        const description = (log.description || "").replace(/"/g, '""')
        const project = log.project?.name || ""
        const task = log.task?.title || ""
        return `"${date}","${user}","${action}","${description}","${project}","${task}"`
      })
      .join("\n")

    return { data: header + rows, format: "csv" as const }
  }

  return { data: logs, format: "json" as const }
}
