import { z } from 'zod'

// Get All Students validation
export const getAllStudentsAdminSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  role: z.enum(['student', 'admin']).optional(),
  enrollment_status: z.enum(['active', 'completed', 'dropped']).optional(),
  sort_by: z.enum(['created_at', 'full_name', 'email', 'enrollments_count', 'completed_courses']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  course_id: z.string().uuid().optional(),
})

// Get Student Details validation
export const getStudentDetailsSchema = z.object({
  student_id: z.string().uuid(),
  include_enrollments: z.boolean().optional().default(true),
  include_progress: z.boolean().optional().default(true),
  include_analytics: z.boolean().optional().default(false),
})

// Get Student Progress validation
export const getStudentProgressSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid().optional(),
  include_lessons: z.boolean().optional().default(true),
  include_watch_time: z.boolean().optional().default(true),
  status_filter: z.enum(['all', 'completed', 'in_progress', 'not_started']).optional().default('all'),
})

// Get Student Enrollments validation
export const getStudentEnrollmentsSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(['active', 'completed', 'dropped']).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
  sort_by: z.enum(['enrolled_at', 'completed_at', 'progress']).optional().default('enrolled_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  include_progress: z.boolean().optional().default(true),
})

// Get Student Analytics validation
export const getStudentAnalyticsSchema = z.object({
  student_id: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  metrics: z.array(z.enum([
    'enrollments',
    'completions', 
    'watch_time',
    'progress_rate',
    'engagement_score',
    'learning_streak',
    'course_performance'
  ])).optional().default(['enrollments', 'completions', 'watch_time']),
})

// Export Student Data validation
export const exportStudentDataSchema = z.object({
  student_ids: z.array(z.string().uuid()).optional(),
  format: z.enum(['csv', 'xlsx', 'json']).optional().default('csv'),
  include_progress: z.boolean().optional().default(true),
  include_enrollments: z.boolean().optional().default(true),
  include_analytics: z.boolean().optional().default(false),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  course_filter: z.string().uuid().optional(),
})

// Get Learning Path validation
export const getStudentLearningPathSchema = z.object({
  student_id: z.string().uuid(),
  include_recommendations: z.boolean().optional().default(true),
  include_prerequisites: z.boolean().optional().default(true),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional().default('all'),
  category_id: z.string().uuid().optional(),
})

// Reset Student Progress validation
export const resetStudentProgressSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid().optional(),
  lesson_id: z.string().uuid().optional(),
  reset_type: z.enum(['all', 'course', 'lesson']).default('course'),
  confirm: z.boolean().default(false),
})

export type GetAllStudentsAdminInput = z.infer<typeof getAllStudentsAdminSchema>
export type GetStudentDetailsInput = z.infer<typeof getStudentDetailsSchema>
export type GetStudentProgressInput = z.infer<typeof getStudentProgressSchema>
export type GetStudentEnrollmentsInput = z.infer<typeof getStudentEnrollmentsSchema>
export type GetStudentAnalyticsInput = z.infer<typeof getStudentAnalyticsSchema>
export type ExportStudentDataInput = z.infer<typeof exportStudentDataSchema>
export type GetStudentLearningPathInput = z.infer<typeof getStudentLearningPathSchema>
export type ResetStudentProgressInput = z.infer<typeof resetStudentProgressSchema> 