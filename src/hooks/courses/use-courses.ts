"use client"

import { useQuery } from "@tanstack/react-query"
import { getCourses } from "@/actions/courses/get-courses"
import { Course } from "@/types/custom.types"

interface UseCoursesOptions {
  enabled?: boolean
}

export function useCourses(options: UseCoursesOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["courses"],
    queryFn: async (): Promise<Course[]> => {
      const result = await getCourses()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes("không hợp lệ")) {
        return false
      }
      return failureCount < 3
    },
  })
} 