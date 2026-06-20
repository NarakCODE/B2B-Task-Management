import { DoDTemplateModel, TaskDoDModel } from "../models/dod-template.model"
import TaskModel from "../models/task.model"
import { NotFoundException, BadRequestException } from "../utils/appError"

export const createDoDTemplateService = async (
  workspaceId: string,
  userId: string,
  body: {
    name: string
    project?: string | null
    taskType?: string | null
    items: Array<{ description: string; isRequired?: boolean; order?: number }>
  },
) => {
  const items = body.items.map((item, index) => ({
    description: item.description,
    isRequired: item.isRequired !== undefined ? item.isRequired : true,
    order: item.order !== undefined ? item.order : index,
  }))

  const template = new DoDTemplateModel({
    name: body.name,
    workspace: workspaceId,
    project: body.project || null,
    taskType: body.taskType || null,
    items: items as any,
  })
  await template.save()

  return { template }
}

export const listDoDTemplatesService = async (
  workspaceId: string,
  projectId?: string,
  taskType?: string,
) => {
  const query: Record<string, any> = { workspace: workspaceId }

  if (projectId) query.project = { $in: [null, projectId] }
  if (taskType) query.taskType = { $in: [null, taskType] }

  const templates = await DoDTemplateModel.find(query)
  return { templates }
}

export const updateDoDTemplateService = async (
  workspaceId: string,
  templateId: string,
  body: {
    name?: string
    items?: Array<{ description: string; isRequired?: boolean; order?: number }>
  },
) => {
  const template = await DoDTemplateModel.findOne({ _id: templateId, workspace: workspaceId })
  if (!template) {
    throw new NotFoundException("DoD template not found")
  }

  if (body.name) template.name = body.name
  if (body.items) {
    template.items = body.items.map((item, index) => ({
      description: item.description,
      isRequired: item.isRequired !== undefined ? item.isRequired : true,
      order: item.order !== undefined ? item.order : index,
    })) as any
  }

  await template.save()
  return { template }
}

export const deleteDoDTemplateService = async (workspaceId: string, templateId: string) => {
  const template = await DoDTemplateModel.findOneAndDelete({
    _id: templateId,
    workspace: workspaceId,
  })
  if (!template) {
    throw new NotFoundException("DoD template not found")
  }
  return
}

export const attachDoDToTaskService = async (
  workspaceId: string,
  taskId: string,
  templateId: string,
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found")
  }

  const template = await DoDTemplateModel.findOne({ _id: templateId, workspace: workspaceId })
  if (!template) {
    throw new NotFoundException("DoD template not found")
  }

  const existing = await TaskDoDModel.findOne({ task: taskId })
  if (existing) {
    throw new BadRequestException("Task already has a DoD checklist")
  }

  const items = template.items.map((item) => ({
    itemId: item._id?.toString() || "",
    description: item.description,
    isRequired: item.isRequired,
    isCompleted: false,
    completedBy: null,
    completedAt: null,
  }))

  const taskDoD = new TaskDoDModel({
    task: taskId,
    workspace: workspaceId,
    template: templateId,
    items,
    allCompleted: false,
  })
  await taskDoD.save()

  return { taskDoD }
}

export const toggleDoDItemService = async (
  workspaceId: string,
  taskId: string,
  itemId: string,
  userId: string,
) => {
  const taskDoD = await TaskDoDModel.findOne({ task: taskId, workspace: workspaceId })
  if (!taskDoD) {
    throw new NotFoundException("DoD checklist not found for this task")
  }

  const item = taskDoD.items.find((i) => i.itemId === itemId)
  if (!item) {
    throw new NotFoundException("DoD item not found")
  }

  item.isCompleted = !item.isCompleted
  item.completedBy = item.isCompleted ? (userId as any) : null
  item.completedAt = item.isCompleted ? new Date() : null

  taskDoD.allCompleted = taskDoD.items.every((i) => !i.isRequired || i.isCompleted)

  await taskDoD.save()
  return { taskDoD }
}

export const getTaskDoDService = async (workspaceId: string, taskId: string) => {
  const taskDoD = await TaskDoDModel.findOne({ task: taskId, workspace: workspaceId }).populate(
    "items.completedBy",
    "_id name profilePicture -password",
  )

  if (!taskDoD) {
    throw new NotFoundException("DoD checklist not found for this task")
  }

  // Check if all required items are completed
  const requiredItems = taskDoD.items.filter((i) => i.isRequired)
  const completedRequired = requiredItems.filter((i) => i.isCompleted)
  const canComplete = requiredItems.length > 0 && requiredItems.length === completedRequired.length

  return { taskDoD, canComplete }
}
