import DeploymentModel from "../models/deployment.model"
import TaskModel from "../models/task.model"
import PullRequestModel from "../models/pull-request.model"
import { NotFoundException } from "../utils/appError"

export const createDeploymentService = async (
  workspaceId: string,
  body: {
    provider: string
    environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT"
    status?: string
    commitSha?: string | null
    branch?: string | null
    release?: string | null
    project?: string | null
    startedAt?: string | null
    completedAt?: string | null
    metadata?: Record<string, any> | null
  },
) => {
  const deployment = new DeploymentModel({
    provider: body.provider,
    environment: body.environment,
    status: body.status || "PENDING",
    commitSha: body.commitSha || null,
    branch: body.branch || null,
    release: body.release || null,
    project: body.project || null,
    startedAt: body.startedAt ? new Date(body.startedAt) : null,
    completedAt: body.completedAt ? new Date(body.completedAt) : null,
    workspace: workspaceId,
    metadata: body.metadata || null,
  })

  await deployment.save()
  return { deployment }
}

export const getDeploymentsByProjectService = async (
  workspaceId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number,
) => {
  const totalCount = await DeploymentModel.countDocuments({
    workspace: workspaceId,
    project: projectId,
  })
  const skip = (pageNumber - 1) * pageSize

  const deployments = await DeploymentModel.find({ workspace: workspaceId, project: projectId })
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { deployments, totalCount, totalPages, skip }
}

export const getDeploymentsByWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number,
  environment?: string,
) => {
  const query: Record<string, any> = { workspace: workspaceId }
  if (environment) query.environment = environment

  const totalCount = await DeploymentModel.countDocuments(query)
  const skip = (pageNumber - 1) * pageSize

  const deployments = await DeploymentModel.find(query)
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { deployments, totalCount, totalPages, skip }
}

export const getDeploymentByIdService = async (workspaceId: string, deploymentId: string) => {
  const deployment = await DeploymentModel.findOne({ _id: deploymentId, workspace: workspaceId })
  if (!deployment) {
    throw new NotFoundException("Deployment not found")
  }

  // Find linked PRs by commit sha
  let linkedPRs: any[] = []
  if (deployment.commitSha) {
    linkedPRs = await PullRequestModel.find({
      workspace: workspaceId,
    }).sort({ createdAt: -1 })
  }

  return { deployment, linkedPRs }
}

export const handleDeploymentWebhookService = async (workspaceId: string, payload: any) => {
  const environment = (payload.environment || "DEVELOPMENT").toUpperCase()
  const validEnv = ["PRODUCTION", "STAGING", "DEVELOPMENT"].includes(environment)
    ? (environment as any)
    : "DEVELOPMENT"

  const deployment = await createDeploymentService(workspaceId, {
    provider: payload.provider || "github",
    environment: validEnv,
    status: payload.status || "SUCCESS",
    commitSha: payload.commit_sha || null,
    branch: payload.branch || null,
    release: payload.release || null,
    project: payload.project_id || null,
    startedAt: payload.started_at || null,
    completedAt: payload.completed_at || null,
    metadata: payload.metadata || null,
  })

  return { deployment }
}

export const getDeploymentsByReleaseService = async (workspaceId: string, release: string) => {
  const deployments = await DeploymentModel.find({ workspace: workspaceId, release }).sort({
    createdAt: -1,
  })

  return { deployments }
}
