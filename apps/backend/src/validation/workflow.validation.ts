import { z } from "zod"
import { WorkflowCategoryEnum } from "../enums/workflow.enum"

export const workflowStateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.enum(Object.values(WorkflowCategoryEnum) as [string, ...string[]]),
  color: z.string().trim().optional().default("#6b7280"),
  order: z.number().int().min(0),
  isDefault: z.boolean().optional().default(false),
})

export const createWorkflowSchema = z.object({
  project: z.string().trim().optional().nullable(),
  states: z.array(workflowStateSchema).min(1),
})

export const updateWorkflowSchema = z.object({
  states: z.array(workflowStateSchema).min(1),
})
