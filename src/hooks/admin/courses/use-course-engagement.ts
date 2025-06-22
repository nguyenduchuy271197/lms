import { useQuery } from '@tanstack/react-query'
import { getCourseEngagement } from '@/actions/admin/courses/get-course-engagement'
import type { GetCourseEngagementInput } from '@/lib/validations/admin-course-management'

export function useCourseEngagement(params: GetCourseEngagementInput, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'courses', 'engagement', params.course_id, params.period, params.metrics],
    queryFn: async () => {
      const result = await getCourseEngagement(params)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: enabled && !!params.course_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
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