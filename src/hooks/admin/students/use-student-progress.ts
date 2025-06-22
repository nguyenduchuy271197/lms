'use client'

import { useQuery } from '@tanstack/react-query'
import { getStudentProgress } from '@/actions/admin/students/get-student-progress'
import { type GetStudentProgressInput } from '@/lib/validations/admin-student-management'

export function useStudentProgress(params: GetStudentProgressInput) {
  return useQuery({
    queryKey: ['admin', 'students', 'progress', params.student_id, params],
    queryFn: async () => {
      const result = await getStudentProgress(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!params.student_id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
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