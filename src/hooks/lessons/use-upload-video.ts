"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { uploadVideo } from "@/actions/lessons/upload-video"
import { type UploadVideoInput } from "@/lib/validations/lesson"
import { Lesson } from "@/types/custom.types"
import { LABELS } from "@/constants/labels"

export function useUploadVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UploadVideoInput) => {
      const result = await uploadVideo(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Update the lesson cache with the new video URL
      queryClient.setQueryData(["lessons", data.id], data)
      
      // Update the lesson in course lessons list
      queryClient.setQueryData<Lesson[]>(
        ["lessons", "by-course", data.course_id],
        (old) => {
          if (!old) return [data]
          
          return old.map(lesson => 
            lesson.id === data.id ? data : lesson
          )
        }
      )
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["lessons", "by-course", data.course_id]
      })

      toast.success(LABELS.SUCCESS.uploaded)
    },
    onError: (error) => {
      console.error("Upload video error:", error)
      toast.error(error.message)
    },
  })
} 