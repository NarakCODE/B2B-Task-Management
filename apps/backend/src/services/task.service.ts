import { TaskPriorityEnum, TaskStatusEnum, TaskTypeEnum } from "../enums/task.enum"
import MemberModel from "../models/member.model"
import ProjectModel from "../models/project.model"
import TaskModel from "../models/task.model"
import SprintModel from "../models/sprint.model"
import UserModel from "../models/user.model"
import { logActivity } from "./activity-log.service"
import { createNotificationService } from "./notification.service"
import { validateTaskStatusService } from "./workflow.service"
import { BadRequestException, NotFoundException } from "../utils/appError"

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string
    description?: string
    priority: string
    status: string
    assignedTo?: string | null
    dueDate?: string
    taskType?: string
    storyPoints?: number | null
    sprint?: string | null
  },
) => {
  const {
    title,
    description,
    priority,
    status,
    assignedTo,
    dueDate,
    taskType,
    storyPoints,
    sprint,
  } = body

  const project = await ProjectModel.findById(projectId)

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project not found or does not belong to this workspace")
  }
  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    })

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not a member of this workspace.")
    }
  }

  if (sprint) {
    const existingSprint = await SprintModel.findById(sprint)
    if (!existingSprint || existingSprint.project.toString() !== projectId.toString()) {
      throw new NotFoundException("Sprint not found or does not belong to this project.")
    }
  }

  const validStatus = status
    ? await validateTaskStatusService(workspaceId, projectId, status)
    : TaskStatusEnum.TODO

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: validStatus,
    taskType: taskType || TaskTypeEnum.FEATURE,
    storyPoints: storyPoints !== undefined ? storyPoints : null,
    sprint: sprint || null,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  })

  await task.save()

  // Trigger Notification to Assignee (if not the creator)
  if (assignedTo && assignedTo.toString() !== userId.toString()) {
    const senderUser = await UserModel.findById(userId)
    const senderName = senderUser?.name || "Someone"
    await createNotificationService({
      recipient: assignedTo,
      sender: userId,
      workspace: workspaceId,
      project: projectId,
      task: task._id.toString(),
      type: "ASSIGNED",
      title: "Task Assigned",
      message: `${senderName} assigned you the task: "${title}"`,
    })
  }

  await logActivity({
    workspaceId,
    projectId,
    sprintId: sprint || null,
    taskId: task._id.toString(),
    userId,
    actionType: "CREATE_TASK",
    description: `created task "${title}"`,
  })

  return { task }
}

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  body: {
    title: string
    description?: string
    priority: string
    status: string
    assignedTo?: string | null
    dueDate?: string
    taskType?: string
    storyPoints?: number | null
    sprint?: string | null
  },
) => {
  const project = await ProjectModel.findById(projectId)

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project not found or does not belong to this workspace")
  }

  const task = await TaskModel.findById(taskId)

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException("Task not found or does not belong to this project")
  }

  if (body.sprint) {
    const existingSprint = await SprintModel.findById(body.sprint)
    if (!existingSprint || existingSprint.project.toString() !== projectId.toString()) {
      throw new NotFoundException("Sprint not found or does not belong to this project.")
    }
  }

  // Trigger Notifications for status changes and assignee changes
  const currentAssignee = task.assignedTo ? task.assignedTo.toString() : null
  const newAssignee = body.assignedTo !== undefined ? body.assignedTo : currentAssignee

  // 1. Assignee Updated
  if (body.assignedTo !== undefined && body.assignedTo !== currentAssignee) {
    if (body.assignedTo && body.assignedTo !== userId) {
      const senderUser = await UserModel.findById(userId)
      const senderName = senderUser?.name || "Someone"
      await createNotificationService({
        recipient: body.assignedTo,
        sender: userId,
        workspace: workspaceId,
        project: projectId,
        task: task._id.toString(),
        type: "ASSIGNED",
        title: "Task Assigned",
        message: `${senderName} assigned you the task: "${task.title}"`,
      })
    }
  }

  // 2. Status Updated
  if (body.status && body.status !== task.status && newAssignee && newAssignee !== userId) {
    const senderUser = await UserModel.findById(userId)
    const senderName = senderUser?.name || "Someone"
    await createNotificationService({
      recipient: newAssignee,
      sender: userId,
      workspace: workspaceId,
      project: projectId,
      task: task._id.toString(),
      type: "STATUS_CHANGE",
      title: "Task Status Updated",
      message: `${senderName} updated task status to "${body.status.replace("_", " ").toLowerCase()}"`,
    })
  }

  if (body.status) {
    body.status = await validateTaskStatusService(workspaceId, projectId, body.status)
  }

  // Log activity if status or priority changed
  if (body.status && body.status !== task.status) {
    await logActivity({
      workspaceId,
      projectId,
      sprintId: task.sprint?.toString() || null,
      taskId: task._id.toString(),
      userId,
      actionType: "UPDATE_TASK_STATUS",
      metadata: { oldStatus: task.status, newStatus: body.status },
      description: `changed status of task "${task.title}" to ${body.status}`,
    })
  }

  if (body.priority && body.priority !== task.priority) {
    await logActivity({
      workspaceId,
      projectId,
      sprintId: task.sprint?.toString() || null,
      taskId: task._id.toString(),
      userId,
      actionType: "UPDATE_TASK_PRIORITY",
      metadata: { oldPriority: task.priority, newPriority: body.priority },
      description: `changed priority of task "${task.title}" to ${body.priority}`,
    })
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true },
  )

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task")
  }

  return { updatedTask }
}

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string
    status?: string[]
    priority?: string[]
    assignedTo?: string[]
    keyword?: string
    dueDate?: string
    sprint?: string
    taskType?: string[]
    epic?: string
  },
  pagination: {
    pageSize: number
    pageNumber: number
  },
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  }

  if (filters.projectId) {
    query.project = filters.projectId
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status }
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority }
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo }
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" }
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    }
  }

  if (filters.sprint) {
    if (filters.sprint === "backlog") {
      query.sprint = null
    } else {
      query.sprint = filters.sprint
    }
  }

  if (filters.taskType && filters.taskType.length > 0) {
    query.taskType = { $in: filters.taskType }
  }

  if (filters.epic) {
    query.epic = filters.epic
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination
  const skip = (pageNumber - 1) * pageSize

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name")
      .populate("sprint", "_id name status startDate endDate"),
    TaskModel.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  }
}

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
) => {
  const project = await ProjectModel.findById(projectId)

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException("Project not found or does not belong to this workspace")
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  })
    .populate("assignedTo", "_id name profilePicture -password")
    .populate("sprint", "_id name status startDate endDate")
    .populate("dependencies.task", "_id title taskCode status priority")
    .populate("attachments.uploadedBy", "_id name profilePicture")

  if (!task) {
    throw new NotFoundException("Task not found.")
  }

  return task
}

export const deleteTaskService = async (workspaceId: string, taskId: string) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  })

  if (!task) {
    throw new NotFoundException("Task not found or does not belong to the specified workspace")
  }

  return
}

export const addSubtaskService = async (
  workspaceId: string,
  taskId: string,
  body: { title: string },
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found in this workspace")
  }

  task.subtasks.push({
    title: body.title,
    isCompleted: false,
  } as any)

  await task.save()

  const newSubtask = task.subtasks[task.subtasks.length - 1]
  return { subtask: newSubtask }
}

export const toggleSubtaskService = async (
  workspaceId: string,
  taskId: string,
  subtaskId: string,
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found in this workspace")
  }

  const subtask = task.subtasks.id(subtaskId)
  if (!subtask) {
    throw new NotFoundException("Subtask not found")
  }

  subtask.isCompleted = !subtask.isCompleted
  await task.save()

  return { subtask }
}

export const deleteSubtaskService = async (
  workspaceId: string,
  taskId: string,
  subtaskId: string,
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found in this workspace")
  }

  const subtask = task.subtasks.id(subtaskId)
  if (!subtask) {
    throw new NotFoundException("Subtask not found")
  }

  task.subtasks.pull(subtaskId)
  await task.save()

  return { message: "Subtask deleted successfully" }
}

const getInverseDependencyType = (
  type: "BLOCKED_BY" | "BLOCKS" | "RELATED" | "PARENT" | "CHILD",
): "BLOCKED_BY" | "BLOCKS" | "RELATED" | "PARENT" | "CHILD" => {
  switch (type) {
    case "BLOCKED_BY":
      return "BLOCKS"
    case "BLOCKS":
      return "BLOCKED_BY"
    case "PARENT":
      return "CHILD"
    case "CHILD":
      return "PARENT"
    default:
      return "RELATED"
  }
}

export const addTaskDependencyService = async (
  workspaceId: string,
  taskId: string,
  dependencyTaskId: string,
  type: "BLOCKED_BY" | "BLOCKS" | "RELATED" | "PARENT" | "CHILD",
) => {
  if (taskId.toString() === dependencyTaskId.toString()) {
    throw new BadRequestException("A task cannot depend on itself")
  }

  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  const depTask = await TaskModel.findOne({ _id: dependencyTaskId, workspace: workspaceId })

  if (!task || !depTask) {
    throw new NotFoundException("One or both tasks not found in this workspace")
  }

  // Check if link already exists
  const exists = task.dependencies.some(
    (dep) => dep.task.toString() === dependencyTaskId.toString() && dep.type === type,
  )

  if (exists) {
    throw new BadRequestException("This dependency relationship already exists")
  }

  // Add dependency to task
  task.dependencies.push({ type, task: depTask._id })
  await task.save()

  // Add inverse dependency to depTask
  const inverseType = getInverseDependencyType(type)
  const depExists = depTask.dependencies.some(
    (dep) => dep.task.toString() === taskId.toString() && dep.type === inverseType,
  )

  if (!depExists) {
    depTask.dependencies.push({ type: inverseType, task: task._id })
    await depTask.save()
  }

  const populatedTask = await TaskModel.findById(taskId)
    .populate("assignedTo", "_id name profilePicture -password")
    .populate("sprint", "_id name status startDate endDate")
    .populate("dependencies.task", "_id title taskCode status priority")

  return { task: populatedTask }
}

export const reorderTasksService = async (
  workspaceId: string,
  tasks: Array<{ taskId: string; sortOrder: number }>,
) => {
  const operations = tasks.map(({ taskId, sortOrder }) => ({
    updateOne: {
      filter: { _id: taskId, workspace: workspaceId },
      update: { $set: { sortOrder } },
    },
  }))

  await TaskModel.bulkWrite(operations)
  return
}

export const getBacklogTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string
    status?: string[]
    priority?: string[]
    assignedTo?: string[]
    keyword?: string
    taskType?: string[]
  },
  pagination: {
    pageSize: number
    pageNumber: number
  },
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
    sprint: null,
  }

  if (filters.projectId) query.project = filters.projectId
  if (filters.status && filters.status?.length > 0) query.status = { $in: filters.status }
  if (filters.priority && filters.priority?.length > 0) query.priority = { $in: filters.priority }
  if (filters.assignedTo && filters.assignedTo?.length > 0)
    query.assignedTo = { $in: filters.assignedTo }
  if (filters.keyword) query.title = { $regex: filters.keyword, $options: "i" }
  if (filters.taskType && filters.taskType.length > 0) query.taskType = { $in: filters.taskType }

  const { pageSize, pageNumber } = pagination
  const skip = (pageNumber - 1) * pageSize

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    tasks,
    pagination: { pageSize, pageNumber, totalCount, totalPages, skip },
  }
}

export const deleteTaskDependencyService = async (
  workspaceId: string,
  taskId: string,
  dependencyTaskId: string,
  type: "BLOCKED_BY" | "BLOCKS" | "RELATED" | "PARENT" | "CHILD",
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  const depTask = await TaskModel.findOne({ _id: dependencyTaskId, workspace: workspaceId })

  if (!task || !depTask) {
    throw new NotFoundException("One or both tasks not found in this workspace")
  }

  // Remove dependency from task
  task.dependencies = task.dependencies.filter(
    (dep) => !(dep.task.toString() === dependencyTaskId.toString() && dep.type === type),
  )
  await task.save()

  // Remove inverse dependency from depTask
  const inverseType = getInverseDependencyType(type)
  depTask.dependencies = depTask.dependencies.filter(
    (dep) => !(dep.task.toString() === taskId.toString() && dep.type === inverseType),
  )
  await depTask.save()

  const populatedTask = await TaskModel.findById(taskId)
    .populate("assignedTo", "_id name profilePicture -password")
    .populate("sprint", "_id name status startDate endDate")
    .populate("dependencies.task", "_id title taskCode status priority")

  return { task: populatedTask }
}
