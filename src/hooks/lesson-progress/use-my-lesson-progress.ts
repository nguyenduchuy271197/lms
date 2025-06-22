'use client'

import { useQuery } from '@tanstack/react-query'
import { getMyLessonProgress } from '@/actions/lesson-progress/get-my-lesson-progress'
import type { GetMyLessonProgressInput } from '@/lib/validations/lesson-progress'
import type { LessonProgress } from '@/types/custom.types'

export function useMyLessonProgress(input: GetMyLessonProgressInput) {
  return useQuery<LessonProgress[], Error>({
    queryKey: ['lesson-progress', 'my', input.lesson_id, input.course_id],
    queryFn: () => getMyLessonProgress(input),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('không có quyền') || error.message.includes('đăng nhập')) {
        return false
      }
      return failureCount < 3
    },
  })
} 