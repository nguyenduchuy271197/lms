'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateLessonProgress } from '@/actions/lesson-progress/update-lesson-progress'
import type { UpdateLessonProgressInput } from '@/lib/validations/lesson-progress'
import type { LessonProgress } from '@/types/custom.types'

export function useUpdateLessonProgress() {
  const queryClient = useQueryClient()

  return useMutation<LessonProgress, Error, UpdateLessonProgressInput>({
    mutationFn: updateLessonProgress,
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] })
      queryClient.invalidateQueries({ queryKey: ['course-progress'] })
      
      // Update specific progress cache if it exists
      queryClient.setQueryData(['lesson-progress', data.id], data)
      
      // Update my lesson progress cache
      queryClient.invalidateQueries({ 
        queryKey: ['lesson-progress', 'my', variables.lesson_id] 
      })
      
      // Show success message only if lesson was completed
      if (variables.completed_at) {
        toast.success('Đã đánh dấu bài học hoàn thành')
      }
    },
    onError: (error) => {
      console.error('Error updating lesson progress:', error)
      toast.error(error.message || 'Cập nhật tiến độ bài học thất bại')
    },
  })
} 