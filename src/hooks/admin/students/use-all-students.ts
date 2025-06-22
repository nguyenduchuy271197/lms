'use client'

import { useQuery } from '@tanstack/react-query'
import { getAllStudents } from '@/actions/admin/students/get-all-students'
import { type GetAllStudentsAdminInput } from '@/lib/validations/admin-student-management'

export function useAllStudents(params: GetAllStudentsAdminInput) {
  return useQuery({
    queryKey: ['admin', 'students', 'all', params],
    queryFn: async () => {
      const result = await getAllStudents(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('admin') || error.message.includes('quyền')) {
        return false
      }
      return failureCount < 3
    }
  })
} 