'use client'

import { useQuery } from '@tanstack/react-query'
import { getUserById } from '@/actions/user-management/get-user-by-id'
import type { GetUserByIdInput } from '@/lib/validations/user-management'
import type { Profile } from '@/types/custom.types'

export function useUserById(input: GetUserByIdInput, enabled: boolean = true) {
  return useQuery<Profile>({
    queryKey: ['users', 'byId', input.id],
    queryFn: () => getUserById(input),
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