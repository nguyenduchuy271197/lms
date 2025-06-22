"use client"

import { useQuery } from "@tanstack/react-query"
import { getCourse } from "@/actions/courses/get-course"
import { Course } from "@/types/custom.types"
import type { GetCourseInput } from "@/lib/validations/course"

interface UseCourseOptions {
  enabled?: boolean
}

export function useCourse(params: GetCourseInput, options: UseCourseOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["course", params.id],
    queryFn: async (): Promise<Course> => {
      const result = await getCourse(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!params.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors or not found errors
      if (error instanceof Error && 
          (error.message.includes("không hợp lệ") || 
           error.message.includes("Không tìm thấy"))) {
        return false
      }
      return failureCount < 3
    },
  })
} 