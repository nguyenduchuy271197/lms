import { z } from "zod"
import { VALIDATION_ERRORS } from "@/constants/error-messages"

// Create lesson validation schema
export const createLessonSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
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
  lesson_type: z.literal("video").default("video"),
  video_url: z
    .string()
    .url(VALIDATION_ERRORS.INVALID_URL_FORMAT)
    .optional()
    .nullable(),
  duration_seconds: z
    .number()
    .int("Thời lượng phải là số nguyên")
    .min(0, "Thời lượng không được âm")
    .optional()
    .default(0),
  order_index: z
    .number()
    .int("Thứ tự phải là số nguyên")
    .min(1, "Thứ tự phải lớn hơn 0"),
  is_published: z.boolean().optional().default(false),
})

// Update lesson validation schema
export const updateLessonSchema = z.object({
  id: z.string().uuid("ID bài học không hợp lệ"),
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
  lesson_type: z.literal("video").optional(),
  video_url: z
    .string()
    .url(VALIDATION_ERRORS.INVALID_URL_FORMAT)
    .optional()
    .nullable(),
  duration_seconds: z
    .number()
    .int("Thời lượng phải là số nguyên")
    .min(0, "Thời lượng không được âm")
    .optional(),
  order_index: z
    .number()
    .int("Thứ tự phải là số nguyên")
    .min(1, "Thứ tự phải lớn hơn 0")
    .optional(),
  is_published: z.boolean().optional(),
})

// Delete lesson validation schema
export const deleteLessonSchema = z.object({
  id: z.string().uuid("ID bài học không hợp lệ"),
})

// Get lesson validation schema
export const getLessonSchema = z.object({
  id: z.string().uuid("ID bài học không hợp lệ"),
})

// Get lessons by course validation schema
export const getLessonsByCourseSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
})

// Upload video validation schema
export const uploadVideoSchema = z.object({
  lessonId: z.string().uuid("ID bài học không hợp lệ"),
  formData: z.instanceof(FormData, { message: "Dữ liệu file không hợp lệ" }),
})

// Publish lesson validation schema
export const publishLessonSchema = z.object({
  id: z.string().uuid("ID bài học không hợp lệ"),
  is_published: z.boolean(),
})

// Reorder lessons validation schema
export const reorderLessonsSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
  lessons: z.array(z.object({
    id: z.string().uuid("ID bài học không hợp lệ"),
    order_index: z.number().int("Thứ tự phải là số nguyên").min(1, "Thứ tự phải lớn hơn 0"),
  })).min(1, "Danh sách bài học không được trống"),
})

export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type DeleteLessonInput = z.infer<typeof deleteLessonSchema>
export type GetLessonInput = z.infer<typeof getLessonSchema>
export type GetLessonsByCourseInput = z.infer<typeof getLessonsByCourseSchema>
export type UploadVideoInput = z.infer<typeof uploadVideoSchema>
export type PublishLessonInput = z.infer<typeof publishLessonSchema>
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema> 