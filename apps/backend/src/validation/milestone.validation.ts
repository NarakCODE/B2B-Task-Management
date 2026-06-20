import { z } from "zod"

export const milestoneIdSchema = z.string().trim().min(1)

export const createMilestoneSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  dueDate: z.string().trim().optional().nullable(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED"]).optional().default("OPEN"),
})

export const updateMilestoneSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional(),
  dueDate: z.string().trim().optional().nullable(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED"]).optional(),
})
