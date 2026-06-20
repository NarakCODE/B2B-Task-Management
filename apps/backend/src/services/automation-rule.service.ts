import AutomationRuleModel from "../models/automation-rule.model"
import TaskModel from "../models/task.model"
import { NotFoundException, BadRequestException } from "../utils/appError"
import { triggerSlackNotification } from "./integration.service"
import { logActivity } from "./activity-log.service"

export const createAutomationRuleService = async (
  workspaceId: string,
  userId: string,
  body: {
    name: string
    description?: string
    trigger: string
    conditions?: Record<string, any> | null
    actions: Array<{ type: string; params: Record<string, any> }>
    project?: string | null
  },
) => {
  const rule = new AutomationRuleModel({
    name: body.name,
    description: body.description || null,
    trigger: body.trigger,
    conditions: body.conditions || null,
    actions: body.actions as any,
    isActive: true,
    workspace: workspaceId,
    project: body.project || null,
    createdBy: userId,
  })
  await rule.save()

  return { rule }
}

export const listAutomationRulesService = async (
  workspaceId: string,
  projectId?: string,
  trigger?: string,
) => {
  const query: Record<string, any> = { workspace: workspaceId }
  if (projectId) query.project = { $in: [null, projectId] }
  if (trigger) query.trigger = trigger

  const rules = await AutomationRuleModel.find(query).populate("createdBy", "_id name -password")
  return { rules }
}

export const updateAutomationRuleService = async (
  workspaceId: string,
  ruleId: string,
  body: {
    name?: string
    description?: string
    trigger?: string
    conditions?: Record<string, any> | null
    actions?: Array<{ type: string; params: Record<string, any> }>
    isActive?: boolean
  },
) => {
  const rule = await AutomationRuleModel.findOne({ _id: ruleId, workspace: workspaceId })
  if (!rule) {
    throw new NotFoundException("Automation rule not found")
  }

  if (body.name !== undefined) rule.name = body.name
  if (body.description !== undefined) rule.description = body.description
  if (body.trigger !== undefined) rule.trigger = body.trigger as any
  if (body.conditions !== undefined) rule.conditions = body.conditions
  if (body.actions !== undefined) rule.actions = body.actions as any
  if (body.isActive !== undefined) rule.isActive = body.isActive

  await rule.save()
  return { rule }
}

export const deleteAutomationRuleService = async (workspaceId: string, ruleId: string) => {
  const rule = await AutomationRuleModel.findOneAndDelete({ _id: ruleId, workspace: workspaceId })
  if (!rule) {
    throw new NotFoundException("Automation rule not found")
  }
  return
}

export const executeAutomationRulesService = async (
  workspaceId: string,
  trigger: string,
  context: Record<string, any>,
) => {
  const rules = await AutomationRuleModel.find({
    workspace: workspaceId,
    trigger: trigger as any,
    isActive: true,
  })

  const results = []
  for (const rule of rules) {
    try {
      // Check conditions if defined
      if (rule.conditions) {
        const conditionsMet = Object.entries(rule.conditions).every(([key, value]) => {
          return context[key] === value
        })
        if (!conditionsMet) continue
      }

      for (const action of rule.actions) {
        switch (action.type) {
          case "CHANGE_STATUS": {
            if (context.taskId) {
              const task = await TaskModel.findOne({ _id: context.taskId, workspace: workspaceId })
              if (task && action.params.status) {
                const oldStatus = task.status
                task.status = action.params.status
                await task.save()
                await logActivity({
                  workspaceId,
                  taskId: task._id.toString(),
                  projectId: task.project?.toString() || null,
                  userId: context.userId || task.createdBy.toString(),
                  actionType: "UPDATE_TASK_STATUS",
                  description: `automation: status changed to ${action.params.status}`,
                  metadata: { oldStatus, newStatus: action.params.status, ruleName: rule.name },
                })
              }
            }
            break
          }
          case "NOTIFY_SLACK": {
            const message = action.params.message || `Automation triggered: ${rule.name}`
            await triggerSlackNotification(workspaceId, message)
            break
          }
          case "SET_PRIORITY": {
            if (context.taskId && action.params.priority) {
              await TaskModel.updateOne(
                { _id: context.taskId, workspace: workspaceId },
                { $set: { priority: action.params.priority } },
              )
            }
            break
          }
        }
      }

      results.push({ ruleId: rule._id, ruleName: rule.name, success: true })
    } catch (error) {
      console.error(`Error executing automation rule ${rule.name}:`, error)
      results.push({ ruleId: rule._id, ruleName: rule.name, success: false, error })
    }
  }

  return { executed: results.length, results }
}
