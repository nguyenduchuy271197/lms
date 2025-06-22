import { z } from "zod"


// Create enrollment validation schema
export const createEnrollmentSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
})

// Update enrollment status validation schema
export const updateEnrollmentStatusSchema = z.object({
  id: z.string().uuid("ID đăng ký không hợp lệ"),
  status: z.enum(["active", "completed", "dropped"], {
    errorMap: () => ({ message: "Trạng thái đăng ký không hợp lệ" })
  }),
})

// Get enrollment validation schema
export const getEnrollmentSchema = z.object({
  id: z.string().uuid("ID đăng ký không hợp lệ"),
})

// Get enrollments by student validation schema
export const getEnrollmentsByStudentSchema = z.object({
  student_id: z.string().uuid("ID học viên không hợp lệ"),
})

// Get enrollments by course validation schema
export const getEnrollmentsByCourseSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
})

// Get my enrollments validation schema (no params needed as it uses current user)
export const getMyEnrollmentsSchema = z.object({
  status: z.enum(["active", "completed", "dropped"]).optional(),
})

// Delete enrollment validation schema
export const deleteEnrollmentSchema = z.object({
  id: z.string().uuid("ID đăng ký không hợp lệ"),
})

// Check enrollment validation schema
export const checkEnrollmentSchema = z.object({
  course_id: z.string().uuid("ID khóa học không hợp lệ"),
  student_id: z.string().uuid("ID học viên không hợp lệ").optional(),
})

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>
export type GetEnrollmentInput = z.infer<typeof getEnrollmentSchema>
export type GetEnrollmentsByStudentInput = z.infer<typeof getEnrollmentsByStudentSchema>
export type GetEnrollmentsByCourseInput = z.infer<typeof getEnrollmentsByCourseSchema>
export type GetMyEnrollmentsInput = z.infer<typeof getMyEnrollmentsSchema>
export type DeleteEnrollmentInput = z.infer<typeof deleteEnrollmentSchema>
export type CheckEnrollmentInput = z.infer<typeof checkEnrollmentSchema> 