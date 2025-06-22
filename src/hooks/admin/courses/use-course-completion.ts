import { useQuery } from '@tanstack/react-query'
import { getCourseCompletion } from '@/actions/admin/courses/get-completion-rates'
import type { GetCourseCompletionInput } from '@/lib/validations/admin-course-management'

export function useCourseCompletion(params: GetCourseCompletionInput) {
  return useQuery({
    queryKey: ['admin', 'courses', 'completion', params.course_id, params.category_id, params.period, params.min_completion_rate],
    queryFn: async () => {
      const result = await getCourseCompletion(params)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 20, // Refetch every 20 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error?.message?.includes('admin') || 
        error?.message?.includes('Unauthorized')
      ) {
        return false
      }
      return failureCount < 3
    },
  })
} 