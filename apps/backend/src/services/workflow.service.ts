import WorkflowModel from "../models/workflow.model"
import ProjectModel from "../models/project.model"
import TaskModel from "../models/task.model"
import { NotFoundException, BadRequestException } from "../utils/appError"
import { WorkflowCategoryEnum } from "../enums/workflow.enum"

export const getOrCreateDefaultWorkflowService = async (
  workspaceId: string,
  projectId?: string | null,
) => {
  let workflow = await WorkflowModel.findOne({
    workspace: workspaceId,
    project: projectId || null,
  })

  if (!workflow) {
    const defaultStates = [
      {
        name: "Backlog",
        category: WorkflowCategoryEnum.BACKLOG,
        color: "#6b7280",
        order: 0,
        isDefault: false,
        workspace: workspaceId,
        project: projectId || null,
      },
      {
        name: "To Do",
        category: WorkflowCategoryEnum.TODO,
        color: "#3b82f6",
        order: 1,
        isDefault: true,
        workspace: workspaceId,
        project: projectId || null,
      },
      {
        name: "In Progress",
        category: WorkflowCategoryEnum.IN_PROGRESS,
        color: "#eab308",
        order: 2,
        isDefault: false,
        workspace: workspaceId,
        project: projectId || null,
      },
      {
        name: "In Review",
        category: WorkflowCategoryEnum.REVIEW,
        color: "#a855f7",
        order: 3,
        isDefault: false,
        workspace: workspaceId,
        project: projectId || null,
      },
      {
        name: "Done",
        category: WorkflowCategoryEnum.DONE,
        color: "#22c55e",
        order: 4,
        isDefault: false,
        workspace: workspaceId,
        project: projectId || null,
      },
    ]

    workflow = new WorkflowModel({
      workspace: workspaceId,
      project: projectId || null,
      states: defaultStates,
    })
    await workflow.save()
  }

  return { workflow }
}

export const createWorkflowService = async (
  workspaceId: string,
  userId: string,
  body: {
    project?: string | null
    states: Array<{
      name: string
      category: string
      color?: string
      order: number
      isDefault?: boolean
    }>
  },
) => {
  const projectId = body.project || null

  if (projectId) {
    const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
    if (!project) {
      throw new NotFoundException("Project not found in this workspace")
    }
  }

  const existing = await WorkflowModel.findOne({ workspace: workspaceId, project: projectId })
  if (existing) {
    throw new BadRequestException("Workflow already exists for this scope. Use update instead.")
  }

  const states = body.states.map((s) => ({
    name: s.name,
    category: s.category,
    color: s.color || "#6b7280",
    order: s.order,
    isDefault: s.isDefault || false,
    workspace: workspaceId,
    project: projectId,
  }))

  const workflow = new WorkflowModel({
    workspace: workspaceId,
    project: projectId,
    states,
  })
  await workflow.save()

  return { workflow }
}

export const updateWorkflowService = async (
  workspaceId: string,
  workflowId: string,
  body: {
    states: Array<{
      name: string
      category: string
      color?: string
      order: number
      isDefault?: boolean
    }>
  },
) => {
  const workflow = await WorkflowModel.findOne({ _id: workflowId, workspace: workspaceId })
  if (!workflow) {
    throw new NotFoundException("Workflow not found")
  }

  const states = body.states.map((s) => ({
    name: s.name,
    category: s.category,
    color: s.color || "#6b7280",
    order: s.order,
    isDefault: s.isDefault || false,
    workspace: workspaceId,
    project: workflow.project,
  }))

  workflow.states = states as any
  await workflow.save()

  return { workflow }
}

export const getWorkspaceWorkflowsService = async (workspaceId: string) => {
  const workflows = await WorkflowModel.find({ workspace: workspaceId })
  return { workflows }
}

export const getWorkflowByIdService = async (workspaceId: string, workflowId: string) => {
  const workflow = await WorkflowModel.findOne({ _id: workflowId, workspace: workspaceId })
  if (!workflow) {
    throw new NotFoundException("Workflow not found")
  }
  return { workflow }
}

export const deleteWorkflowService = async (workspaceId: string, workflowId: string) => {
  const workflow = await WorkflowModel.findOneAndDelete({ _id: workflowId, workspace: workspaceId })
  if (!workflow) {
    throw new NotFoundException("Workflow not found")
  }
  return
}

export const validateTaskStatusService = async (
  workspaceId: string,
  projectId: string,
  status: string,
) => {
  const { workflow } = await getOrCreateDefaultWorkflowService(workspaceId, projectId)
  const validStatuses = workflow.states.map((s) => s.name)
  if (!validStatuses.includes(status)) {
    const defaultState = workflow.states.find((s) => s.isDefault)
    return defaultState?.name || "To Do"
  }
  return status
}
