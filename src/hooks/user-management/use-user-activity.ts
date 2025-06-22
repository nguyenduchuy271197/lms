'use client'

import { useQuery } from '@tanstack/react-query'
import { getUserActivity, type UserActivity } from '@/actions/user-management/get-user-activity'
import type { GetUserActivityInput } from '@/lib/validations/user-management'

export function useUserActivity(input: GetUserActivityInput, enabled: boolean = true) {
  return useQuery<UserActivity>({
    queryKey: ['users', 'activity', input.id, input.days],
    queryFn: () => getUserActivity(input),
    enabled: enabled && !!input.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
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