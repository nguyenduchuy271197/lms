"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadThumbnail } from "@/actions/courses/upload-thumbnail"
import { LABELS } from "@/constants/labels"
import { Course } from "@/types/custom.types"
import type { UploadThumbnailInput } from "@/lib/validations/course"
import { toast } from "sonner"

interface UseUploadThumbnailOptions {
  onSuccess?: (data: { thumbnail_url: string }) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useUploadThumbnail(options: UseUploadThumbnailOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UploadThumbnailInput) => {
      const result = await uploadThumbnail(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update course cache with new thumbnail URL
      const courseId = variables.courseId
      
      queryClient.setQueryData<Course[]>(["courses"], (old) =>
        old ? old.map(course => 
          course.id === courseId 
            ? { ...course, thumbnail_url: data.thumbnail_url, updated_at: new Date().toISOString() }
            : course
        ) : []
      )

      queryClient.setQueryData<Course>(["course", courseId], (old) =>
        old ? { ...old, thumbnail_url: data.thumbnail_url, updated_at: new Date().toISOString() } : old
      )

      // Also update slug-based cache if available
      const existingCourse = queryClient.getQueryData<Course>(["course", courseId])
      if (existingCourse?.slug) {
        queryClient.setQueryData<Course>(["course", "slug", existingCourse.slug], (old) =>
          old ? { ...old, thumbnail_url: data.thumbnail_url, updated_at: new Date().toISOString() } : old
        )
      }
      
      if (showToast) {
        toast.success(LABELS.SUCCESS.uploaded)
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