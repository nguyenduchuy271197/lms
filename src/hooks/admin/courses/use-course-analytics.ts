import { useQuery } from '@tanstack/react-query'
import { getCourseAnalytics } from '@/actions/admin/courses/get-course-analytics'
import type { GetCourseAnalyticsInput } from '@/lib/validations/admin-course-management'

export function useCourseAnalytics(params: GetCourseAnalyticsInput, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'courses', 'analytics', params.course_id, params.period, params.start_date, params.end_date],
    queryFn: async () => {
      const result = await getCourseAnalytics(params)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: enabled && !!params.course_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors or course not found
      if (
        error?.message?.includes('admin') || 
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('không tìm thấy')
      ) {
        return false
      }
      return failureCount < 3
    },
  })
} 