'use client'

import { useQuery } from '@tanstack/react-query'
import { getStudentAnalytics } from '@/actions/admin/students/get-student-analytics'
import { type GetStudentAnalyticsInput } from '@/lib/validations/admin-student-management'

export function useStudentAnalytics(params: GetStudentAnalyticsInput) {
  return useQuery({
    queryKey: ['admin', 'students', 'analytics', params.student_id, params],
    queryFn: async () => {
      const result = await getStudentAnalytics(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!params.student_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors or student not found
      if (error.message.includes('admin') || error.message.includes('quyền') || error.message.includes('Không tìm thấy')) {
        return false
      }
      return failureCount < 3
    }
  })
} 