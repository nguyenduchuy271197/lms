'use client'

import { useQuery } from '@tanstack/react-query'
import { getStudentDetails } from '@/actions/admin/students/get-student-details'
import { type GetStudentDetailsInput } from '@/lib/validations/admin-student-management'

export function useStudentDetails(params: GetStudentDetailsInput) {
  return useQuery({
    queryKey: ['admin', 'students', 'details', params.student_id, params],
    queryFn: async () => {
      const result = await getStudentDetails(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!params.student_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
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