"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyEnrollments } from "@/actions/enrollments/get-my-enrollments"
import { type GetMyEnrollmentsInput } from "@/lib/validations/enrollment"
import { EnrollmentWithDetails } from "@/types/custom.types"

interface UseMyEnrollmentsOptions {
  status?: GetMyEnrollmentsInput["status"]
  enabled?: boolean
}

export function useMyEnrollments(options: UseMyEnrollmentsOptions = {}) {
  const { status, enabled = true } = options

  return useQuery<EnrollmentWithDetails[]>({
    queryKey: ["my-enrollments", { status }],
    queryFn: async () => {
      const result = await getMyEnrollments({ status })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("không có quyền") || error.message.includes("đăng nhập")) {
        return false
      }
      return failureCount < 3
    },
  })
} 