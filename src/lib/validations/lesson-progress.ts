import { z } from "zod"

// Get lesson progress validation schema
export const getLessonProgressSchema = z.object({
  id: z.string().uuid("ID tiến độ bài học không hợp lệ"),
})

// Get lesson progress by student validation schema
export const getLessonProgressByStudentSchema = z.object({
  student_id: z.string().uuid("ID học viên không hợp lệ"),
  lesson_id: z.string().uuid("ID bài học không hợp lệ").optional(),
  course_id: z.string().uuid("ID khóa học không hợp lệ").optional(),
})

// Get lesson progress by lesson validation schema
export const getLessonProgressByLessonSchema = z.object({
  lesson_id: z.string().uuid("ID bài học không hợp lệ"),
})

// Get my lesson progress validation schema
export const getMyLessonProgressSchema = z.object({
  lesson_id: z.string().uuid("ID bài học không hợp lệ").optional(),
  course_id: z.string().uuid("ID khóa học không hợp lệ").optional(),
})

// Update lesson progress validation schema
export const updateLessonProgressSchema = z.object({
  lesson_id: z.string().uuid("ID bài học không hợp lệ"),
  watched_seconds: z.number().int().min(0, "Thời gian xem phải là số dương"),
  completed_at: z.string().datetime().optional().nullable(),
})

// Mark lesson complete validation schema
export const markLessonCompleteSchema = z.object({
  lesson_id: z.string().uuid("ID bài học không hợp lệ"),
  watched_seconds: z.number().int().min(0, "Thời gian xem phải là số dương").optional(),
})

// Mark lesson incomplete validation schema
export const markLessonIncompleteSchema = z.object({
  lesson_id: z.string().uuid("ID bài học không hợp lệ"),
})

// Get course progress validation schema
export const getCourseProgressSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
  student_id: z.string().uuid("ID học viên không hợp lệ").optional(),
})

// Reset lesson progress validation schema
export const resetLessonProgressSchema = z.object({
  lesson_id: z.string().uuid("ID bài học không hợp lệ"),
  student_id: z.string().uuid("ID học viên không hợp lệ").optional(),
})

export type GetLessonProgressInput = z.infer<typeof getLessonProgressSchema>
export type GetLessonProgressByStudentInput = z.infer<typeof getLessonProgressByStudentSchema>
export type GetLessonProgressByLessonInput = z.infer<typeof getLessonProgressByLessonSchema>
export type GetMyLessonProgressInput = z.infer<typeof getMyLessonProgressSchema>
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>
export type MarkLessonCompleteInput = z.infer<typeof markLessonCompleteSchema>
export type MarkLessonIncompleteInput = z.infer<typeof markLessonIncompleteSchema>
export type GetCourseProgressInput = z.infer<typeof getCourseProgressSchema>
export type ResetLessonProgressInput = z.infer<typeof resetLessonProgressSchema>