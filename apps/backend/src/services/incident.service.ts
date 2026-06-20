import IncidentModel from "../models/incident.model"
import { NotFoundException } from "../utils/appError"
import { triggerSlackNotification } from "./integration.service"

export const createIncidentService = async (
  workspaceId: string,
  userId: string,
  body: {
    title: string
    description?: string
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    environment?: string | null
    impact?: string | null
    project?: string | null
    task?: string | null
    release?: string | null
  },
) => {
  const incident = new IncidentModel({
    title: body.title,
    description: body.description || null,
    severity: body.severity,
    environment: body.environment || null,
    impact: body.impact || null,
    status: "DETECTED",
    workspace: workspaceId,
    project: body.project || null,
    task: body.task || null,
    release: body.release || null,
  })
  await incident.save()

  if (body.severity === "CRITICAL" || body.severity === "HIGH") {
    await triggerSlackNotification(
      workspaceId,
      `🚨 *${body.severity} Incident Reported*\n*Title*: ${body.title}\n*Impact*: ${body.impact || "N/A"}`,
    )
  }

  return { incident }
}

export const getIncidentsService = async (
  workspaceId: string,
  filters: {
    severity?: string
    status?: string
    projectId?: string
  },
  pageSize: number,
  pageNumber: number,
) => {
  const query: Record<string, any> = { workspace: workspaceId }

  if (filters.severity) query.severity = filters.severity
  if (filters.status) query.status = filters.status
  if (filters.projectId) query.project = filters.projectId

  const totalCount = await IncidentModel.countDocuments(query)
  const skip = (pageNumber - 1) * pageSize

  const incidents = await IncidentModel.find(query)
    .skip(skip)
    .limit(pageSize)
    .populate("owner", "_id name profilePicture -password")
    .populate("task", "_id title taskCode")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { incidents, totalCount, totalPages, skip }
}

export const getIncidentByIdService = async (workspaceId: string, incidentId: string) => {
  const incident = await IncidentModel.findOne({ _id: incidentId, workspace: workspaceId })
    .populate("owner", "_id name profilePicture -password")
    .populate("task", "_id title taskCode")

  if (!incident) {
    throw new NotFoundException("Incident not found")
  }

  return { incident }
}

export const updateIncidentService = async (
  workspaceId: string,
  incidentId: string,
  body: {
    title?: string
    description?: string
    severity?: string
    environment?: string | null
    impact?: string | null
    rootCause?: string | null
    status?: string
    owner?: string | null
    project?: string | null
    task?: string | null
    release?: string | null
  },
) => {
  const incident = await IncidentModel.findOne({ _id: incidentId, workspace: workspaceId })
  if (!incident) {
    throw new NotFoundException("Incident not found")
  }

  if (body.title !== undefined) incident.title = body.title
  if (body.description !== undefined) incident.description = body.description
  if (body.severity !== undefined) incident.severity = body.severity as any
  if (body.environment !== undefined) incident.environment = body.environment
  if (body.impact !== undefined) incident.impact = body.impact
  if (body.rootCause !== undefined) incident.rootCause = body.rootCause
  if (body.status !== undefined) incident.status = body.status as any
  if (body.owner !== undefined) incident.owner = body.owner as any
  if (body.project !== undefined) incident.project = body.project as any
  if (body.task !== undefined) incident.task = body.task as any
  if (body.release !== undefined) incident.release = body.release as any

  if (body.status === "RESOLVED" || body.status === "CLOSED") {
    incident.resolvedAt = new Date()
  }

  await incident.save()
  return { incident }
}
