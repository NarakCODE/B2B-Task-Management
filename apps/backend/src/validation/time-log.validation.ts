import { z } from "zod";

export const durationMinutesSchema = z.number().int().min(1);
export const descriptionSchema = z.string().trim().optional();
export const timeLogIdSchema = z.string().trim().min(1);

export const logTimeSchema = z.object({
  durationMinutes: durationMinutesSchema,
  description: descriptionSchema,
  loggedAt: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
});
