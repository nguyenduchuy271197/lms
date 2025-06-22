'use client'

import { useQuery } from '@tanstack/react-query'
import { getAllUsers, type PaginatedUsersResponse } from '@/actions/user-management/get-all-users'
import type { GetAllUsersInput } from '@/lib/validations/user-management'

export function useAllUsers(input: GetAllUsersInput) {
  return useQuery<PaginatedUsersResponse>({
    queryKey: ['users', 'all', input],
    queryFn: () => getAllUsers(input),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('không có quyền') || error?.message?.includes('unauthorized')) {
        return false
      }
      return failureCount < 3
    },
  })
} 