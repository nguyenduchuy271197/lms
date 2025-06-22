'use client'

import { useQuery } from '@tanstack/react-query'
import { getLessonProgress } from '@/actions/lesson-progress/get-lesson-progress'
import type { GetLessonProgressInput } from '@/lib/validations/lesson-progress'
import type { LessonProgress } from '@/types/custom.types'

export function useLessonProgress(input: GetLessonProgressInput, enabled: boolean = true) {
  return useQuery<LessonProgress, Error>({
    queryKey: ['lesson-progress', input.id],
    queryFn: () => getLessonProgress(input),
    enabled: enabled && !!input.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
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