"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserProfile } from "@/actions/users/get-profile"

export const QUERY_KEYS = {
  profile: ["profile"] as const,
} as const

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      const result = await getUserProfile()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      if (error?.message?.includes("Unauthorized")) {
        return false
      }
      return failureCount < 3
    },
  })
} 