import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  setCapacityService,
  bulkSetCapacityService,
  getSprintCapacityService,
} from "../services/capacity.service"
import { createCapacitySchema, bulkCapacitySchema } from "../validation/capacity.validation"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const setCapacityController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const body = createCapacitySchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const { capacity } = await setCapacityService(workspaceId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Capacity set successfully",
    capacity,
  })
})

export const bulkSetCapacityController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const { capacities } = bulkCapacitySchema.parse(req.body)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const result = await bulkSetCapacityService(workspaceId, capacities)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Capabilities set successfully",
    ...result,
  })
})

export const getSprintCapacityController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const sprintId = z.string().trim().min(1).parse(req.params.sprintId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const result = await getSprintCapacityService(workspaceId, sprintId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Sprint capacity fetched successfully",
    ...result,
  })
})
