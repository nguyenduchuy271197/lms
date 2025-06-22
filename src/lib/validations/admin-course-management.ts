import { z } from 'zod'

// Get All Courses Schema (Admin)
export const getAllCoursesAdminSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  is_published: z.boolean().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'enrollments_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Get Course Analytics Schema
export const getCourseAnalyticsSchema = z.object({
  course_id: z.string().uuid(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

// Bulk Update Courses Schema
export const bulkUpdateCoursesSchema = z.object({
  course_ids: z.array(z.string().uuid()).min(1, 'Phải chọn ít nhất một khóa học'),
  action: z.enum(['publish', 'unpublish', 'delete', 'update_category']),
  data: z.object({
    category_id: z.string().uuid().optional(),
    is_published: z.boolean().optional(),
  }).optional(),
})

// Export Courses Schema
export const exportCoursesSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
  filters: z.object({
    category_id: z.string().uuid().optional(),
    is_published: z.boolean().optional(),
    created_after: z.string().datetime().optional(),
    created_before: z.string().datetime().optional(),
  }).optional(),
  include_analytics: z.boolean().default(false),
  include_enrollments: z.boolean().default(false),
})

// Get Course Engagement Schema
export const getCourseEngagementSchema = z.object({
  course_id: z.string().uuid(),
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  metrics: z.array(z.enum(['views', 'enrollments', 'completions', 'watch_time', 'drop_rate'])).default(['views', 'enrollments', 'completions']),
})

// Get Popular Courses Schema
export const getPopularCoursesSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  period: z.enum(['day', 'week', 'month', 'year', 'all_time']).default('month'),
  metric: z.enum(['enrollments', 'completions', 'watch_time', 'rating']).default('enrollments'),
  category_id: z.string().uuid().optional(),
})

// Get Course Completion Rates Schema
export const getCourseCompletionSchema = z.object({
  course_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  min_completion_rate: z.number().min(0).max(100).optional(),
})

// Type exports
export type GetAllCoursesAdminInput = z.infer<typeof getAllCoursesAdminSchema>
export type GetCourseAnalyticsInput = z.infer<typeof getCourseAnalyticsSchema>
export type BulkUpdateCoursesInput = z.infer<typeof bulkUpdateCoursesSchema>
export type ExportCoursesInput = z.infer<typeof exportCoursesSchema>
export type GetCourseEngagementInput = z.infer<typeof getCourseEngagementSchema>
export type GetPopularCoursesInput = z.infer<typeof getPopularCoursesSchema>
export type GetCourseCompletionInput = z.infer<typeof getCourseCompletionSchema> 