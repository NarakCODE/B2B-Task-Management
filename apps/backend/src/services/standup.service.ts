import { StandupModel, StandupUpdateModel } from "../models/standup.model"
import { NotFoundException, BadRequestException } from "../utils/appError"
import { triggerSlackNotification } from "./integration.service"

export const createStandupService = async (
  workspaceId: string,
  userId: string,
  body: {
    name: string
    project?: string | null
    schedule?: string
    channel?: string | null
  },
) => {
  const standup = new StandupModel({
    name: body.name,
    workspace: workspaceId,
    project: body.project || null,
    schedule: body.schedule || "0 9 * * 1-5",
    channel: body.channel || null,
    isActive: true,
    createdBy: userId,
  })
  await standup.save()

  return { standup }
}

export const listStandupsService = async (workspaceId: string, projectId?: string) => {
  const query: Record<string, any> = { workspace: workspaceId }
  if (projectId) query.project = projectId

  const standups = await StandupModel.find(query).populate("createdBy", "_id name -password")
  return { standups }
}

export const submitStandupUpdateService = async (
  workspaceId: string,
  standupId: string,
  userId: string,
  body: {
    yesterday?: string
    today?: string
    blockers?: string
    linkedTasks?: string[]
  },
) => {
  const standup = await StandupModel.findOne({ _id: standupId, workspace: workspaceId })
  if (!standup) {
    throw new NotFoundException("Standup not found")
  }

  // Check if already submitted today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const existingUpdate = await StandupUpdateModel.findOne({
    standup: standupId,
    user: userId,
    date: { $gte: today },
  })

  if (existingUpdate) {
    existingUpdate.yesterday = body.yesterday || existingUpdate.yesterday
    existingUpdate.today = body.today || existingUpdate.today
    existingUpdate.blockers = body.blockers || existingUpdate.blockers
    if (body.linkedTasks) existingUpdate.linkedTasks = body.linkedTasks as any
    await existingUpdate.save()

    return { update: existingUpdate, isUpdate: true }
  }

  const update = new StandupUpdateModel({
    standup: standupId,
    workspace: workspaceId,
    user: userId,
    yesterday: body.yesterday || null,
    today: body.today || null,
    blockers: body.blockers || null,
    linkedTasks: (body.linkedTasks || []) as any,
    date: new Date(),
  })
  await update.save()

  if (body.blockers) {
    await triggerSlackNotification(
      workspaceId,
      `🚧 *Blocker Reported in Standup*\nUser mentioned a blocker.\n*Details*: ${body.blockers}`,
    )
  }

  return { update, isUpdate: false }
}

export const getStandupUpdatesService = async (
  workspaceId: string,
  standupId: string,
  date?: string,
) => {
  const standup = await StandupModel.findOne({ _id: standupId, workspace: workspaceId })
  if (!standup) {
    throw new NotFoundException("Standup not found")
  }

  const query: Record<string, any> = { standup: standupId, workspace: workspaceId }

  if (date) {
    const queryDate = new Date(date)
    queryDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(queryDate)
    nextDay.setDate(nextDay.getDate() + 1)
    query.date = { $gte: queryDate, $lt: nextDay }
  }

  const updates = await StandupUpdateModel.find(query)
    .populate("user", "_id name profilePicture -password")
    .populate("linkedTasks", "_id title taskCode status")
    .sort({ date: -1 })

  // Group by date
  const grouped: Record<string, any> = {}
  updates.forEach((update) => {
    const dateKey = update.date.toISOString().split("T")[0]
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(update)
  })

  return { updates, grouped, totalCount: updates.length }
}

export const getStandupSummaryService = async (workspaceId: string, standupId: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const updates = await StandupUpdateModel.find({
    standup: standupId,
    workspace: workspaceId,
    date: { $gte: today },
  })
    .populate("user", "_id name profilePicture -password")
    .populate("linkedTasks", "_id title taskCode status")

  const membersWithUpdates = updates.map((u) => u.user._id.toString())
  const blockers = updates
    .filter((u) => u.blockers)
    .map((u) => ({ user: u.user, blocker: u.blockers }))

  return {
    date: today,
    totalUpdates: updates.length,
    updates,
    blockers,
    membersWithUpdates,
  }
}
