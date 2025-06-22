"use client"

import { useQuery } from "@tanstack/react-query"
import { getCourseBySlug } from "@/actions/courses/get-course-by-slug"
import { Course } from "@/types/custom.types"
import type { GetCourseBySlugInput } from "@/lib/validations/course"

interface UseCourseBySlugOptions {
  enabled?: boolean
}

export function useCourseBySlug(params: GetCourseBySlugInput, options: UseCourseBySlugOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["course", "slug", params.slug],
    queryFn: async (): Promise<Course> => {
      const result = await getCourseBySlug(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!params.slug,
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