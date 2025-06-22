'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { markLessonIncomplete } from '@/actions/lesson-progress/mark-lesson-incomplete'
import type { MarkLessonIncompleteInput } from '@/lib/validations/lesson-progress'
import type { LessonProgress } from '@/types/custom.types'

export function useMarkLessonIncomplete() {
  const queryClient = useQueryClient()

  return useMutation<LessonProgress, Error, MarkLessonIncompleteInput>({
    mutationFn: markLessonIncomplete,
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
      toast.success('Đã đánh dấu bài học chưa hoàn thành')
    },
    onError: (error) => {
      console.error('Error marking lesson incomplete:', error)
      toast.error(error.message || 'Đánh dấu chưa hoàn thành bài học thất bại')
    },
  })
} 