import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createIncidentService,
  getIncidentsService,
  getIncidentByIdService,
  updateIncidentService,
} from "../services/incident.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createIncidentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.CREATE_TASK])

  const bodySchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().optional(),
    severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    environment: z.string().trim().optional().nullable(),
    impact: z.string().trim().optional().nullable(),
    project: z.string().trim().optional().nullable(),
    task: z.string().trim().optional().nullable(),
    release: z.string().trim().optional().nullable(),
  })
  const body = bodySchema.parse(req.body)

  const { incident } = await createIncidentService(workspaceId, userId, body)

  return res.status(HTTPSTATUS.CREATED).json({ message: "Incident created", incident })
})

export const getIncidentsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const filters = {
    severity: req.query.severity as string | undefined,
    status: req.query.status as string | undefined,
    projectId: req.query.projectId as string | undefined,
  }
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const pageNumber = parseInt(req.query.pageNumber as string) || 1

  const result = await getIncidentsService(workspaceId, filters, pageSize, pageNumber)

  return res.status(HTTPSTATUS.OK).json({ message: "Incidents fetched", ...result })
})

export const getIncidentByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const incidentId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { incident } = await getIncidentByIdService(workspaceId, incidentId)

  return res.status(HTTPSTATUS.OK).json({ message: "Incident fetched", incident })
})

export const updateIncidentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const incidentId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const bodySchema = z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
    environment: z.string().trim().optional().nullable(),
    impact: z.string().trim().optional().nullable(),
    rootCause: z.string().trim().optional().nullable(),
    status: z.enum(["DETECTED", "INVESTIGATING", "MITIGATED", "RESOLVED", "CLOSED"]).optional(),
    owner: z.string().trim().optional().nullable(),
    project: z.string().trim().optional().nullable(),
    task: z.string().trim().optional().nullable(),
    release: z.string().trim().optional().nullable(),
  })
  const body = bodySchema.parse(req.body)

  const { incident } = await updateIncidentService(workspaceId, incidentId, body)

  return res.status(HTTPSTATUS.OK).json({ message: "Incident updated", incident })
})
