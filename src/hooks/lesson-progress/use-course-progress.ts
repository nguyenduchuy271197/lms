'use client'

import { useQuery } from '@tanstack/react-query'
import { getCourseProgress, type CourseProgress } from '@/actions/lesson-progress/get-course-progress'
import type { GetCourseProgressInput } from '@/lib/validations/lesson-progress'

export function useCourseProgress(input: GetCourseProgressInput, enabled: boolean = true) {
  return useQuery<CourseProgress, Error>({
    queryKey: ['course-progress', input.course_id, input.student_id],
    queryFn: () => getCourseProgress(input),
    enabled: enabled && !!input.course_id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth or not found errors
      if (
        error.message.includes('không có quyền') || 
        error.message.includes('đăng nhập') ||
        error.message.includes('không tìm thấy')
      ) {
        return false
      }
      return failureCount < 3
    },
  })
} 