import { z } from 'zod'

// Student Dashboard Stats Schema
export const getStudentDashboardStatsSchema = z.object({
  student_id: z.string().uuid('ID học viên không hợp lệ'),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  include_details: z.boolean().default(false),
})

export type GetStudentDashboardStatsInput = z.infer<typeof getStudentDashboardStatsSchema>

// Admin Dashboard Stats Schema
export const getAdminDashboardStatsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  include_trends: z.boolean().default(true),
  include_breakdowns: z.boolean().default(true),
  category_id: z.string().uuid().optional(),
})

export type GetAdminDashboardStatsInput = z.infer<typeof getAdminDashboardStatsSchema>

// Course Dashboard Stats Schema
export const getCourseDashboardStatsSchema = z.object({
  course_id: z.string().uuid('ID khóa học không hợp lệ'),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  include_student_details: z.boolean().default(false),
  include_lesson_breakdown: z.boolean().default(true),
})

export type GetCourseDashboardStatsInput = z.infer<typeof getCourseDashboardStatsSchema>

// Learning Progress Schema
export const getLearningProgressSchema = z.object({
  student_id: z.string().uuid('ID học viên không hợp lệ'),
  course_id: z.string().uuid().optional(),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  include_predictions: z.boolean().default(false),
})

export type GetLearningProgressInput = z.infer<typeof getLearningProgressSchema>

// Enrollment Report Schema
export const getEnrollmentReportSchema = z.object({
  start_date: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  end_date: z.string().datetime('Ngày kết thúc không hợp lệ'),
  category_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'dropped']).optional(),
  group_by: z.enum(['day', 'week', 'month']).default('day'),
  include_details: z.boolean().default(false),
})

export type GetEnrollmentReportInput = z.infer<typeof getEnrollmentReportSchema>

// Course Performance Schema
export const getCoursePerformanceSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  category_id: z.string().uuid().optional(),
  course_ids: z.array(z.string().uuid()).optional(),
  metrics: z.array(z.enum(['completion_rate', 'avg_progress', 'enrollment_count', 'avg_watch_time', 'engagement_score'])).default(['completion_rate', 'avg_progress', 'enrollment_count']),
  sort_by: z.enum(['completion_rate', 'enrollment_count', 'avg_progress', 'title']).default('completion_rate'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(100).default(20),
})

export type GetCoursePerformanceInput = z.infer<typeof getCoursePerformanceSchema>

// Student Activity Schema
export const getStudentActivitySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  student_ids: z.array(z.string().uuid()).optional(),
  activity_types: z.array(z.enum(['enrollment', 'lesson_completion', 'course_completion', 'watch_time'])).default(['enrollment', 'lesson_completion', 'course_completion']),
  group_by: z.enum(['day', 'week', 'month']).default('day'),
  include_details: z.boolean().default(false),
})

export type GetStudentActivityInput = z.infer<typeof getStudentActivitySchema>

// Learning Analytics Schema
export const getLearningAnalyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  analysis_type: z.enum(['overview', 'engagement', 'completion', 'performance']).default('overview'),
  category_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  include_predictions: z.boolean().default(false),
  include_comparisons: z.boolean().default(true),
})

export type GetLearningAnalyticsInput = z.infer<typeof getLearningAnalyticsSchema>

// Completion Trends Schema
export const getCompletionTrendsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('90d'),
  granularity: z.enum(['day', 'week', 'month']).default('week'),
  category_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  include_forecasting: z.boolean().default(false),
  compare_previous_period: z.boolean().default(true),
})

export type GetCompletionTrendsInput = z.infer<typeof getCompletionTrendsSchema>

// Popular Categories Schema
export const getPopularCategoriesSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  metric: z.enum(['enrollment_count', 'completion_count', 'avg_progress', 'watch_time']).default('enrollment_count'),
  limit: z.number().int().min(1).max(50).default(10),
  include_trends: z.boolean().default(true),
})

export type GetPopularCategoriesInput = z.infer<typeof getPopularCategoriesSchema>

// Watch Time Analytics Schema
export const getWatchTimeAnalyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  course_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  include_peak_hours: z.boolean().default(true),
  include_device_breakdown: z.boolean().default(false),
})

export type GetWatchTimeAnalyticsInput = z.infer<typeof getWatchTimeAnalyticsSchema>

// Export Data Schema
export const exportDataSchema = z.object({
  export_type: z.enum(['enrollments', 'courses', 'students', 'lesson_progress', 'analytics']),
  format: z.enum(['csv', 'excel', 'json', 'pdf']).default('csv'),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('all'),
  filters: z.object({
    category_id: z.string().uuid().optional(),
    course_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
    status: z.enum(['active', 'completed', 'dropped']).optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }).optional(),
  include_details: z.boolean().default(true),
  fields: z.array(z.string()).optional(),
})

export type ExportDataInput = z.infer<typeof exportDataSchema> 