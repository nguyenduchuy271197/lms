"use client"

import { useQuery } from "@tanstack/react-query"
import { getLessonsByCourse } from "@/actions/lessons/get-lessons-by-course"
import { type GetLessonsByCourseInput } from "@/lib/validations/lesson"

interface UseLessonsByCourseProps {
  course_id?: string
  enabled?: boolean
}

export function useLessonsByCourse({ course_id, enabled = true }: UseLessonsByCourseProps) {
  return useQuery({
    queryKey: ["lessons", "by-course", course_id],
    queryFn: async () => {
      if (!course_id) {
        throw new Error("Course ID is required")
      }

      const params: GetLessonsByCourseInput = { course_id }
      const result = await getLessonsByCourse(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!course_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication/authorization errors
      if (error.message.includes("không có quyền") || error.message.includes("không tìm thấy")) {
        return false
      }
      return failureCount < 3
    },
  })
} 