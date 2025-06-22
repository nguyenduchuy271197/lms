import { useQuery } from '@tanstack/react-query'
import { getPopularCourses } from '@/actions/admin/courses/get-popular-courses'
import type { GetPopularCoursesInput } from '@/lib/validations/admin-course-management'

export function usePopularCourses(params: GetPopularCoursesInput) {
  return useQuery({
    queryKey: ['admin', 'courses', 'popular', params.metric, params.period, params.limit, params.category_id],
    queryFn: async () => {
      const result = await getPopularCourses(params)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
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