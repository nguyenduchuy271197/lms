'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { markLessonComplete } from '@/actions/lesson-progress/mark-lesson-complete'
import type { MarkLessonCompleteInput } from '@/lib/validations/lesson-progress'
import type { LessonProgress } from '@/types/custom.types'

export function useMarkLessonComplete() {
  const queryClient = useQueryClient()

  return useMutation<LessonProgress, Error, MarkLessonCompleteInput>({
    mutationFn: markLessonComplete,
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
      
      // Show success message
      toast.success('Đã hoàn thành bài học')
    },
    onError: (error) => {
      console.error('Error marking lesson complete:', error)
      toast.error(error.message || 'Đánh dấu hoàn thành bài học thất bại')
    },
  })
} 