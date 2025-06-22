import { useQuery } from '@tanstack/react-query'
import { getAllCoursesAdmin } from '@/actions/admin/courses/get-all-courses'
import type { GetAllCoursesAdminInput } from '@/lib/validations/admin-course-management'

export function useAllCoursesAdmin(params: GetAllCoursesAdminInput) {
  return useQuery({
    queryKey: ['admin', 'courses', 'all', params],
    queryFn: async () => {
      const result = await getAllCoursesAdmin(params)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('admin') || error?.message?.includes('Unauthorized')) {
        return false
      }
      return failureCount < 3
    },
  })
} 