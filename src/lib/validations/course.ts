import { z } from "zod"
import { VALIDATION_ERRORS } from "@/constants/error-messages"

// Create course validation schema
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, VALIDATION_ERRORS.FIELD_REQUIRED)
    .min(2, VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(200, VALIDATION_ERRORS.NAME_TOO_LONG),
  description: z
    .string()
    .max(2000, VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .nullable(),
  objectives: z
    .string()
    .max(2000, VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .nullable(),
  thumbnail_url: z
    .string()
    .url(VALIDATION_ERRORS.INVALID_URL_FORMAT)
    .optional()
    .nullable(),
  slug: z
    .string()
    .min(1, VALIDATION_ERRORS.FIELD_REQUIRED)
    .regex(/^[a-z0-9-]+$/, VALIDATION_ERRORS.INVALID_SLUG_FORMAT),
  category_id: z
    .string()
    .uuid("ID danh mục không hợp lệ")
    .optional()
    .nullable(),
  is_published: z.boolean().optional().default(false),
})

// Update course validation schema
export const updateCourseSchema = z.object({
  id: z.string().uuid("ID khóa học không hợp lệ"),
  title: z
    .string()
    .min(2, VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(200, VALIDATION_ERRORS.NAME_TOO_LONG)
    .optional(),
  description: z
    .string()
    .max(2000, VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .nullable(),
  objectives: z
    .string()
    .max(2000, VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .nullable(),
  thumbnail_url: z
    .string()
    .url(VALIDATION_ERRORS.INVALID_URL_FORMAT)
    .optional()
    .nullable(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, VALIDATION_ERRORS.INVALID_SLUG_FORMAT)
    .optional(),
  category_id: z
    .string()
    .uuid("ID danh mục không hợp lệ")
    .optional()
    .nullable(),
  is_published: z.boolean().optional(),
})

// Delete course validation schema
export const deleteCourseSchema = z.object({
  id: z.string().uuid("ID khóa học không hợp lệ"),
})

// Get course validation schema
export const getCourseSchema = z.object({
  id: z.string().uuid("ID khóa học không hợp lệ"),
})

// Get course by slug validation schema
export const getCourseBySlugSchema = z.object({
  slug: z.string().min(1, "Slug khóa học là bắt buộc"),
})

// Upload thumbnail validation schema
export const uploadThumbnailSchema = z.object({
  courseId: z.string().uuid("ID khóa học không hợp lệ"),
  formData: z.instanceof(FormData, { message: "Dữ liệu file không hợp lệ" }),
})

// Publish course validation schema
export const publishCourseSchema = z.object({
  id: z.string().uuid("ID khóa học không hợp lệ"),
  is_published: z.boolean(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type DeleteCourseInput = z.infer<typeof deleteCourseSchema>
export type GetCourseInput = z.infer<typeof getCourseSchema>
export type GetCourseBySlugInput = z.infer<typeof getCourseBySlugSchema>
export type UploadThumbnailInput = z.infer<typeof uploadThumbnailSchema>
export type PublishCourseInput = z.infer<typeof publishCourseSchema> 