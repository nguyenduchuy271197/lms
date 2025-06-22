"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCourse } from "@/actions/courses/create-course"
import { LABELS } from "@/constants/labels"
import { Course } from "@/types/custom.types"
import type { CreateCourseInput } from "@/lib/validations/course"
import { toast } from "sonner"

interface UseCreateCourseOptions {
  onSuccess?: (data: Course) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useCreateCourse(options: UseCreateCourseOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateCourseInput) => {
      const result = await createCourse(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch courses
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      
      if (showToast) {
        toast.success(LABELS.SUCCESS.created)
      }
      
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (showToast) {
        toast.error(error.message)
      }
      
      onError?.(error.message)
    },
  })
} 