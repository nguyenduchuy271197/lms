'use client'

import { useQuery } from '@tanstack/react-query'
import { getLearningPath } from '@/actions/admin/students/get-learning-path'
import { type GetStudentLearningPathInput } from '@/lib/validations/admin-student-management'

export function useLearningPath(params: GetStudentLearningPathInput) {
  return useQuery({
    queryKey: ['admin', 'students', 'learning-path', params.student_id, params],
    queryFn: async () => {
      const result = await getLearningPath(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: !!params.student_id,
    staleTime: 15 * 60 * 1000, // 15 minutes
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