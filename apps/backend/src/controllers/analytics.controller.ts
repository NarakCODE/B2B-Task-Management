import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { projectIdSchema } from "../validation/project.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  getCycleTimeService,
  getSprintHealthService,
  getWorkspaceVelocityService,
  getEngineeringDashboardService,
} from "../services/analytics.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const getCycleTimeController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const filters = {
    projectId: req.query.projectId as string | undefined,
    taskId: req.query.taskId as string | undefined,
    assigneeId: req.query.assigneeId as string | undefined,
    sprintId: req.query.sprintId as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  }

  const result = await getCycleTimeService(workspaceId, filters)

  return res.status(HTTPSTATUS.OK).json({
    message: "Cycle time data fetched successfully",
    ...result,
  })
})

export const getSprintHealthController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const sprintId = z.string().trim().min(1).parse(req.params.sprintId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const result = await getSprintHealthService(workspaceId, sprintId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Sprint health data fetched successfully",
    ...result,
  })
})

export const getWorkspaceVelocityController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const sprintCount = parseInt(req.query.sprintCount as string) || 5
  const result = await getWorkspaceVelocityService(workspaceId, sprintCount)

  return res.status(HTTPSTATUS.OK).json({
    message: "Velocity data fetched successfully",
    ...result,
  })
})

export const getEngineeringDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const projectId = req.query.projectId as string | undefined
    const result = await getEngineeringDashboardService(workspaceId, projectId)

    return res.status(HTTPSTATUS.OK).json({
      message: "Engineering dashboard data fetched successfully",
      ...result,
    })
  },
)
