import { z } from "zod"
import { VALIDATION_ERRORS } from "@/constants/error-messages"

// Create category validation schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_ERRORS.FIELD_REQUIRED)
    .min(2, VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(100, VALIDATION_ERRORS.NAME_TOO_LONG),
  description: z
    .string()
    .max(1000, VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .nullable(),
  slug: z
    .string()
    .min(1, VALIDATION_ERRORS.FIELD_REQUIRED)
    .regex(/^[a-z0-9-]+$/, VALIDATION_ERRORS.INVALID_SLUG_FORMAT),
})

// Update category validation schema
export const updateCategorySchema = z.object({
  id: z.string().uuid("ID danh mục không hợp lệ"),
  name: z
    .string()
    .min(2, VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(100, VALIDATION_ERRORS.NAME_TOO_LONG)
    .optional(),
  description: z
    .string()
    .max(1000, VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .nullable(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, VALIDATION_ERRORS.INVALID_SLUG_FORMAT)
    .optional(),
})

// Delete category validation schema
export const deleteCategorySchema = z.object({
  id: z.string().uuid("ID danh mục không hợp lệ"),
})

// Get category validation schema
export const getCategorySchema = z.object({
  id: z.string().uuid("ID danh mục không hợp lệ"),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>
export type GetCategoryInput = z.infer<typeof getCategorySchema> 