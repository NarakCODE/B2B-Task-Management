import { z } from "zod";

export const commentIdSchema = z.string().trim().min(1);
export const contentSchema = z.string().trim().min(1).max(2000);

export const createCommentSchema = z.object({
  content: contentSchema,
});

export const updateCommentSchema = z.object({
  content: contentSchema,
});
