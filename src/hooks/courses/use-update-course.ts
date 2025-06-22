"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateCourse } from "@/actions/courses/update-course"
import { LABELS } from "@/constants/labels"
import { Course } from "@/types/custom.types"
import type { UpdateCourseInput } from "@/lib/validations/course"
import { toast } from "sonner"

interface UseUpdateCourseOptions {
  onSuccess?: (data: Course) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useUpdateCourse(options: UseUpdateCourseOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateCourseInput) => {
      const result = await updateCourse(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (params: UpdateCourseInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["courses"] })
      await queryClient.cancelQueries({ queryKey: ["course", params.id] })

      // Snapshot the previous value
      const previousCourses = queryClient.getQueryData<Course[]>(["courses"])
      const previousCourse = queryClient.getQueryData<Course>(["course", params.id])

      // Optimistically update to the new value
      if (previousCourses) {
        queryClient.setQueryData<Course[]>(["courses"], (old) =>
          old ? old.map(course => 
            course.id === params.id 
              ? { ...course, ...params, updated_at: new Date().toISOString() }
              : course
          ) : []
        )
      }

      if (previousCourse) {
        queryClient.setQueryData<Course>(["course", params.id], (old) =>
          old ? { ...old, ...params, updated_at: new Date().toISOString() } : old
        )
      }

      // Also update course by slug cache if slug is being updated
      if (params.slug && previousCourse) {
        queryClient.setQueryData<Course>(["course", "slug", params.slug], (old) =>
          old ? { ...old, ...params, updated_at: new Date().toISOString() } : old
        )
      }

      // Return a context object with the snapshotted value
      return { previousCourses, previousCourse }
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData<Course[]>(["courses"], (old) =>
        old ? old.map(course => course.id === data.id ? data : course) : []
      )
      queryClient.setQueryData<Course>(["course", data.id], data)
      
      // Update slug-based cache
      if (data.slug) {
        queryClient.setQueryData<Course>(["course", "slug", data.slug], data)
      }
      
      if (showToast) {
        toast.success(LABELS.SUCCESS.updated)
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