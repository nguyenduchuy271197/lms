"use client"

import { useQuery } from "@tanstack/react-query"
import { getLessonsByCourse } from "@/actions/lessons/get-lessons-by-course"
import { Lesson } from "@/types/custom.types"
import type { GetLessonsByCourseInput } from "@/lib/validations/lesson"

interface UseLessonsByCourseOptions {
  enabled?: boolean
}

export function useLessonsByCourse(params: GetLessonsByCourseInput, options: UseLessonsByCourseOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["lessons", "course", params.course_id],
    queryFn: async (): Promise<Lesson[]> => {
      const result = await getLessonsByCourse(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!params.course_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors or access denied
      if (error instanceof Error && 
          (error.message.includes("không hợp lệ") || 
           error.message.includes("không có quyền"))) {
        return false
      }
      return failureCount < 3
    },
  })
} 