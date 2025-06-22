"use client"

import { useQuery } from "@tanstack/react-query"
import { getEnrollmentsByCourse } from "@/actions/enrollments/get-enrollments-by-course"

import { EnrollmentWithDetails } from "@/types/custom.types"

interface UseEnrollmentsByCourseOptions {
  course_id: string
  enabled?: boolean
}

export function useEnrollmentsByCourse(options: UseEnrollmentsByCourseOptions) {
  const { course_id, enabled = true } = options

  return useQuery<EnrollmentWithDetails[]>({
    queryKey: ["enrollments-by-course", course_id],
    queryFn: async () => {
      const result = await getEnrollmentsByCourse({ course_id })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!course_id,
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