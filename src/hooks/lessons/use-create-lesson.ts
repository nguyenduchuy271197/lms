"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createLesson } from "@/actions/lessons/create-lesson"
import { type CreateLessonInput } from "@/lib/validations/lesson"
import { LABELS } from "@/constants/labels"

export function useCreateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateLessonInput) => {
      const result = await createLesson(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch lessons for the course
      queryClient.invalidateQueries({
        queryKey: ["lessons", "by-course", variables.course_id]
      })
      
      // Also invalidate individual lesson queries
      queryClient.invalidateQueries({
        queryKey: ["lessons", data.id]
      })

      toast.success(LABELS.SUCCESS.created)
    },
    onError: (error) => {
      console.error("Create lesson error:", error)
      toast.error(error.message)
    },
  })
} 