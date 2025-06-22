"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteLesson } from "@/actions/lessons/delete-lesson"
import { type DeleteLessonInput } from "@/lib/validations/lesson"
import { Lesson } from "@/types/custom.types"
import { LABELS } from "@/constants/labels"

export function useDeleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteLessonInput) => {
      const result = await deleteLesson(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (variables) => {
      // Get the lesson data before deletion for rollback
      const previousLesson = queryClient.getQueryData<Lesson>(["lessons", variables.id])
      
      // Optimistically remove the lesson from individual cache
      queryClient.removeQueries({ queryKey: ["lessons", variables.id] })
      
      // Optimistically remove from course lessons list
      if (previousLesson) {
        queryClient.setQueryData<Lesson[]>(
          ["lessons", "by-course", previousLesson.course_id],
          (old) => old?.filter(lesson => lesson.id !== variables.id) || []
        )
      }
      
      return { previousLesson }
    },
    onSuccess: (data, variables, context) => {
      // Remove the lesson from all caches
      queryClient.removeQueries({ queryKey: ["lessons", variables.id] })
      
      // Invalidate course lessons to ensure consistency
      if (context?.previousLesson) {
        queryClient.invalidateQueries({
          queryKey: ["lessons", "by-course", context.previousLesson.course_id]
        })
      }

      toast.success(LABELS.SUCCESS.deleted)
    },
    onError: (error, variables, context) => {
      // Rollback: restore the lesson data
      if (context?.previousLesson) {
        queryClient.setQueryData(["lessons", variables.id], context.previousLesson)
        
        // Also restore in course lessons list
        const previousLesson = context.previousLesson
        queryClient.setQueryData<Lesson[]>(
          ["lessons", "by-course", previousLesson.course_id],
          (old) => {
            if (!old) return [previousLesson]
            
            // Check if lesson already exists in the list
            const exists = old.some(lesson => lesson.id === previousLesson.id)
            if (exists) return old
            
            // Add back the lesson and sort by order_index
            return [...old, previousLesson].sort((a, b) => a.order_index - b.order_index)
          }
        )
      }
      
      console.error("Delete lesson error:", error)
      toast.error(error.message)
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch to ensure consistency
      if (context?.previousLesson) {
        queryClient.invalidateQueries({
          queryKey: ["lessons", "by-course", context.previousLesson.course_id]
        })
      }
    },
  })
} 