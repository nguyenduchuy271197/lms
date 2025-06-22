"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateLesson } from "@/actions/lessons/update-lesson"
import { type UpdateLessonInput } from "@/lib/validations/lesson"
import { Lesson } from "@/types/custom.types"
import { LABELS } from "@/constants/labels"

export function useUpdateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateLessonInput) => {
      const result = await updateLesson(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["lessons", variables.id] })
      
      // Snapshot the previous value
      const previousLesson = queryClient.getQueryData<Lesson>(["lessons", variables.id])
      
      // Optimistically update the lesson
      if (previousLesson) {
        queryClient.setQueryData<Lesson>(["lessons", variables.id], {
          ...previousLesson,
          ...variables,
          updated_at: new Date().toISOString(),
        })
      }
      
      // Return a context object with the snapshotted value
      return { previousLesson }
    },
    onSuccess: (data) => {
      // Update the lesson cache with the server response
      queryClient.setQueryData(["lessons", data.id], data)
      
      // Invalidate and refetch lessons for the course
      queryClient.invalidateQueries({
        queryKey: ["lessons", "by-course", data.course_id]
      })

      toast.success(LABELS.SUCCESS.updated)
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLesson) {
        queryClient.setQueryData(["lessons", variables.id], context.previousLesson)
      }
      
      console.error("Update lesson error:", error)
      toast.error(error.message)
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["lessons", variables.id] })
    },
  })
} 