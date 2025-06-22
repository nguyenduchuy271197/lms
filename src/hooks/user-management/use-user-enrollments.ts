'use client'

import { useQuery } from '@tanstack/react-query'
import { getUserEnrollments } from '@/actions/user-management/get-user-enrollments'
import type { GetUserEnrollmentsInput } from '@/lib/validations/user-management'
import type { EnrollmentWithDetails } from '@/types/custom.types'

export function useUserEnrollments(input: GetUserEnrollmentsInput, enabled: boolean = true) {
  return useQuery<EnrollmentWithDetails[]>({
    queryKey: ['users', 'enrollments', input.id, input.status],
    queryFn: () => getUserEnrollments(input),
    enabled: enabled && !!input.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors or not found errors
      if (
        error?.message?.includes('không có quyền') || 
        error?.message?.includes('unauthorized') ||
        error?.message?.includes('không tìm thấy')
      ) {
        return false
      }
      return failureCount < 3
    },
  })
} 