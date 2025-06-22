'use client'

import { useQuery } from '@tanstack/react-query'
import { getLessonProgressByLesson } from '@/actions/lesson-progress/get-lesson-progress-by-lesson'
import type { GetLessonProgressByLessonInput } from '@/lib/validations/lesson-progress'
import type { LessonProgress } from '@/types/custom.types'

export function useLessonProgressByLesson(input: GetLessonProgressByLessonInput, enabled: boolean = true) {
  return useQuery<LessonProgress[], Error>({
    queryKey: ['lesson-progress', 'by-lesson', input.lesson_id],
    queryFn: () => getLessonProgressByLesson(input),
    enabled: enabled && !!input.lesson_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('không có quyền') || error.message.includes('đăng nhập')) {
        return false
      }
      return failureCount < 3
    },
  })
} 