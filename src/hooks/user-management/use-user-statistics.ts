'use client'

import { useQuery } from '@tanstack/react-query'
import { getUserStatistics, type UserStatistics } from '@/actions/user-management/get-user-statistics'
import type { GetUserStatisticsInput } from '@/lib/validations/user-management'

export function useUserStatistics(input: GetUserStatisticsInput) {
  return useQuery<UserStatistics>({
    queryKey: ['users', 'statistics', input.period],
    queryFn: () => getUserStatistics(input),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('không có quyền') || error?.message?.includes('unauthorized')) {
        return false
      }
      return failureCount < 3
    },
  })
} 