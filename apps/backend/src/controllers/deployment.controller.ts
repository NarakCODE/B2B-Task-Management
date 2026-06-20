import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { projectIdSchema } from "../validation/project.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import {
  createDeploymentService,
  getDeploymentsByProjectService,
  getDeploymentsByWorkspaceService,
  getDeploymentByIdService,
  getDeploymentsByReleaseService,
} from "../services/deployment.service"
import { HTTPSTATUS } from "../config/http.config"
import { z } from "zod"

export const createDeploymentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_PROJECT])

  const bodySchema = z.object({
    provider: z.string().trim().min(1),
    environment: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT"]),
    status: z.enum(["PENDING", "IN_PROGRESS", "SUCCESS", "FAILED", "ROLLED_BACK"]).optional(),
    commitSha: z.string().trim().optional().nullable(),
    branch: z.string().trim().optional().nullable(),
    release: z.string().trim().optional().nullable(),
    project: z.string().trim().optional().nullable(),
    startedAt: z.string().trim().optional().nullable(),
    completedAt: z.string().trim().optional().nullable(),
    metadata: z.any().optional().nullable(),
  })
  const body = bodySchema.parse(req.body)

  const { deployment } = await createDeploymentService(workspaceId, body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Deployment created successfully",
    deployment,
  })
})

export const getDeploymentsByProjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
    const projectId = projectIdSchema.parse(req.params.projectId)

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const pageSize = parseInt(req.query.pageSize as string) || 10
    const pageNumber = parseInt(req.query.pageNumber as string) || 1

    const result = await getDeploymentsByProjectService(
      workspaceId,
      projectId,
      pageSize,
      pageNumber,
    )

    return res.status(HTTPSTATUS.OK).json({
      message: "Deployments fetched successfully",
      ...result,
    })
  },
)

export const getWorkspaceDeploymentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
    roleGuard(role, [Permissions.VIEW_ONLY])

    const environment = req.query.environment as string | undefined
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const pageNumber = parseInt(req.query.pageNumber as string) || 1

    const result = await getDeploymentsByWorkspaceService(
      workspaceId,
      pageSize,
      pageNumber,
      environment,
    )

    return res.status(HTTPSTATUS.OK).json({
      message: "Deployments fetched successfully",
      ...result,
    })
  },
)

export const getDeploymentByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const deploymentId = z.string().trim().min(1).parse(req.params.id)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { deployment, linkedPRs } = await getDeploymentByIdService(workspaceId, deploymentId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Deployment fetched successfully",
    deployment,
    linkedPRs,
  })
})

export const handleDeploymentWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

    const { deployments } = await getDeploymentsByReleaseService(
      workspaceId,
      req.body.release || "",
    )

    return res.status(HTTPSTATUS.OK).json({
      message: "Deployment webhook processed",
      deployments,
    })
  },
)
