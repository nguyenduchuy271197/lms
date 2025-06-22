'use client'

import { useQuery } from '@tanstack/react-query'
import { getStudentEnrollments } from '@/actions/admin/students/get-student-enrollments'
import { type GetStudentEnrollmentsInput } from '@/lib/validations/admin-student-management'

export function useStudentEnrollments(params: GetStudentEnrollmentsInput) {
  return useQuery({
    queryKey: ['admin', 'students', 'enrollments', params.student_id, params],
    queryFn: async () => {
      const result = await getStudentEnrollments(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!params.student_id,
    staleTime: 3 * 60 * 1000, // 3 minutes
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