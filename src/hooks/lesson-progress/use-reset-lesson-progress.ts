'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resetLessonProgress } from '@/actions/lesson-progress/reset-lesson-progress'
import type { ResetLessonProgressInput } from '@/lib/validations/lesson-progress'

export function useResetLessonProgress() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; message: string }, Error, ResetLessonProgressInput>({
    mutationFn: resetLessonProgress,
    onSuccess: (data) => {
      // Invalidate all lesson progress queries
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] })
      queryClient.invalidateQueries({ queryKey: ['course-progress'] })
      
      // Show success message
      toast.success(data.message)
    },
    onError: (error) => {
      console.error('Error resetting lesson progress:', error)
      toast.error(error.message || 'Xóa tiến độ bài học thất bại')
    },
  })
} 