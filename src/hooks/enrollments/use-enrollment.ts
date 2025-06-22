"use client"

import { useQuery } from "@tanstack/react-query"
import { getEnrollment } from "@/actions/enrollments/get-enrollment"

import { EnrollmentWithDetails } from "@/types/custom.types"

interface UseEnrollmentOptions {
  id: string
  enabled?: boolean
}

export function useEnrollment(options: UseEnrollmentOptions) {
  const { id, enabled = true } = options

  return useQuery<EnrollmentWithDetails>({
    queryKey: ["enrollment", id],
    queryFn: async () => {
      const result = await getEnrollment({ id })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on not found or auth errors
      if (
        error.message.includes("không tìm thấy") ||
        error.message.includes("không có quyền") || 
        error.message.includes("đăng nhập")
      ) {
        return false
      }
      return failureCount < 3
    },
  })
} 