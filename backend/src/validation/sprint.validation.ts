import { z } from "zod";

export const nameSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim().optional();
export const sprintIdSchema = z.string().trim().min(1);

export const dateSchema = z
  .string()
  .trim()
  .refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid date format" }
  );

export const createSprintSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  startDate: dateSchema,
  endDate: dateSchema,
});

export const updateSprintSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED"]).optional(),
});
