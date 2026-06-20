import { z } from "zod"
import { DocumentCategoryEnum } from "../models/document.model"

export const documentIdSchema = z.string().trim().min(1, {
  message: "Document ID is required",
})

export const documentCategorySchema = z.enum(
  Object.keys(DocumentCategoryEnum) as [
    keyof typeof DocumentCategoryEnum,
    ...(keyof typeof DocumentCategoryEnum)[],
  ],
)

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(600).optional(),
  category: documentCategorySchema.optional(),
})

export const getDocumentsQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  category: documentCategorySchema.optional(),
})
