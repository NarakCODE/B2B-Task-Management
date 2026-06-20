import CapacityModel from "../models/capacity.model"
import TaskModel from "../models/task.model"
import SprintModel from "../models/sprint.model"
import { NotFoundException, BadRequestException } from "../utils/appError"

export const setCapacityService = async (
  workspaceId: string,
  body: {
    sprint: string
    member: string
    availableHours: number
    plannedStoryPoints: number
  },
) => {
  const sprint = await SprintModel.findOne({ _id: body.sprint, workspace: workspaceId })
  if (!sprint) {
    throw new NotFoundException("Sprint not found")
  }

  const existing = await CapacityModel.findOne({
    workspace: workspaceId,
    sprint: body.sprint,
    member: body.member,
  })

  if (existing) {
    existing.availableHours = body.availableHours
    existing.plannedStoryPoints = body.plannedStoryPoints
    await existing.save()
    return { capacity: existing }
  }

  const capacity = new CapacityModel({
    sprint: body.sprint,
    member: body.member,
    workspace: workspaceId,
    availableHours: body.availableHours,
    plannedStoryPoints: body.plannedStoryPoints,
  })
  await capacity.save()

  return { capacity }
}

export const bulkSetCapacityService = async (
  workspaceId: string,
  capacities: Array<{
    sprint: string
    member: string
    availableHours: number
    plannedStoryPoints: number
  }>,
) => {
  const results = []
  for (const cap of capacities) {
    const { capacity } = await setCapacityService(workspaceId, cap)
    results.push(capacity)
  }
  return { capacities: results }
}

export const getSprintCapacityService = async (workspaceId: string, sprintId: string) => {
  const sprint = await SprintModel.findOne({ _id: sprintId, workspace: workspaceId })
  if (!sprint) {
    throw new NotFoundException("Sprint not found")
  }

  const capacities = await CapacityModel.find({
    workspace: workspaceId,
    sprint: sprintId,
  }).populate("member", "_id name profilePicture -password")

  // Get actual task data for the sprint
  const tasks = await TaskModel.find({ workspace: workspaceId, sprint: sprintId }).populate(
    "assignedTo",
    "_id name profilePicture -password",
  )

  const memberStats = capacities.map((cap) => {
    const memberTasks = tasks.filter(
      (t) => t.assignedTo && t.assignedTo.toString() === cap.member.toString(),
    )
    const totalStoryPoints = memberTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
    const completedStoryPoints = memberTasks
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0)

    const isOverAllocated = cap.plannedStoryPoints > 0 && totalStoryPoints > cap.plannedStoryPoints

    return {
      member: cap.member,
      availableHours: cap.availableHours,
      plannedStoryPoints: cap.plannedStoryPoints,
      actualStoryPoints: totalStoryPoints,
      completedStoryPoints,
      isOverAllocated,
      warnings: isOverAllocated ? ["Assigned story points exceed planned capacity"] : [],
      taskCount: memberTasks.length,
    }
  })

  return {
    capacities,
    memberStats,
    totals: {
      totalPlanned: capacities.reduce((s, c) => s + c.plannedStoryPoints, 0),
      totalAvailableHours: capacities.reduce((s, c) => s + c.availableHours, 0),
      totalActual: memberStats.reduce((s, m) => s + m.actualStoryPoints, 0),
      totalCompleted: memberStats.reduce((s, m) => s + m.completedStoryPoints, 0),
    },
    memberCount: capacities.length,
  }
}
