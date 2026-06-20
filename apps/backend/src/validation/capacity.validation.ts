import { z } from "zod"

export const createCapacitySchema = z.object({
  sprint: z.string().trim().min(1),
  member: z.string().trim().min(1),
  availableHours: z.number().min(0).default(0),
  plannedStoryPoints: z.number().min(0).default(0),
})

export const updateCapacitySchema = z.object({
  availableHours: z.number().min(0).optional(),
  plannedStoryPoints: z.number().min(0).optional(),
})

export const bulkCapacitySchema = z.object({
  capacities: z.array(createCapacitySchema).min(1),
})
