import { z } from "zod"

export const releaseIdSchema = z.string().trim().min(1)

export const createReleaseSchema = z.object({
  version: z.string().trim().min(1),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "RELEASED", "CANCELLED"]).optional().default("PLANNED"),
  targetDate: z.string().trim().optional().nullable(),
  releasedAt: z.string().trim().optional().nullable(),
})

export const updateReleaseSchema = z.object({
  version: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "RELEASED", "CANCELLED"]).optional(),
  targetDate: z.string().trim().optional().nullable(),
  releasedAt: z.string().trim().optional().nullable(),
})
