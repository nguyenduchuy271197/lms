"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCourse } from "@/actions/courses/delete-course"
import { LABELS } from "@/constants/labels"
import { Course } from "@/types/custom.types"
import type { DeleteCourseInput } from "@/lib/validations/course"
import { toast } from "sonner"

interface UseDeleteCourseOptions {
  onSuccess?: (data: { id: string }) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useDeleteCourse(options: UseDeleteCourseOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteCourseInput) => {
      const result = await deleteCourse(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (params: DeleteCourseInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["courses"] })
      await queryClient.cancelQueries({ queryKey: ["course", params.id] })

      // Snapshot the previous value
      const previousCourses = queryClient.getQueryData<Course[]>(["courses"])
      const previousCourse = queryClient.getQueryData<Course>(["course", params.id])

      // Optimistically update to the new value
      if (previousCourses) {
        queryClient.setQueryData<Course[]>(["courses"], (old) =>
          old ? old.filter(course => course.id !== params.id) : []
        )
      }

      // Remove individual course from cache
      queryClient.removeQueries({ queryKey: ["course", params.id] })
      
      // Remove course by slug cache if available
      if (previousCourse?.slug) {
        queryClient.removeQueries({ queryKey: ["course", "slug", previousCourse.slug] })
      }

      // Return a context object with the snapshotted value
      return { previousCourses, previousCourse }
    },
    onSuccess: (data) => {
      // Ensure the course is removed from all caches
      queryClient.setQueryData<Course[]>(["courses"], (old) =>
        old ? old.filter(course => course.id !== data.id) : []
      )
      queryClient.removeQueries({ queryKey: ["course", data.id] })
      
      if (showToast) {
        toast.success(LABELS.SUCCESS.deleted)
      }
      
      onSuccess?.(data)
    },
    onError: (error: Error, params, context) => {
      // Rollback optimistic updates
      if (context?.previousCourses) {
        queryClient.setQueryData(["courses"], context.previousCourses)
      }
      if (context?.previousCourse) {
        queryClient.setQueryData(["course", params.id], context.previousCourse)
        
        // Restore slug-based cache
        if (context.previousCourse.slug) {
          queryClient.setQueryData(["course", "slug", context.previousCourse.slug], context.previousCourse)
        }
      }
      
      if (showToast) {
        toast.error(error.message)
      }
      
      onError?.(error.message)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
} 