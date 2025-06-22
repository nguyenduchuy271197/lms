"use client"

import { useQuery } from "@tanstack/react-query"
import { getLesson } from "@/actions/lessons/get-lesson"
import { type GetLessonInput } from "@/lib/validations/lesson"

interface UseLessonProps {
  id?: string
  enabled?: boolean
}

export function useLesson({ id, enabled = true }: UseLessonProps) {
  return useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Lesson ID is required")
      }

      const params: GetLessonInput = { id }
      const result = await getLesson(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!id,
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