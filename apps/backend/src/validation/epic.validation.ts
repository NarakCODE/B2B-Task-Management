import { z } from "zod"

export const epicIdSchema = z.string().trim().min(1)

export const createEpicSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional().default("OPEN"),
  owner: z.string().trim().optional().nullable(),
  startDate: z.string().trim().optional().nullable(),
  targetDate: z.string().trim().optional().nullable(),
})

export const updateEpicSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
  owner: z.string().trim().optional().nullable(),
  startDate: z.string().trim().optional().nullable(),
  targetDate: z.string().trim().optional().nullable(),
})
