"use client"

import { useQuery } from "@tanstack/react-query"
import { checkEnrollment } from "@/actions/enrollments/check-enrollment"


interface UseCheckEnrollmentOptions {
  course_id: string
  student_id?: string
  enabled?: boolean
}

export function useCheckEnrollment(options: UseCheckEnrollmentOptions) {
  const { course_id, student_id, enabled = true } = options

  return useQuery<{ isEnrolled: boolean; status?: string; enrollmentId?: string }>({
    queryKey: ["check-enrollment", course_id, student_id],
    queryFn: async () => {
      const result = await checkEnrollment({ course_id, student_id })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!course_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
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