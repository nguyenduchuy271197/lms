"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { publishLesson } from "@/actions/lessons/publish-lesson"
import { type PublishLessonInput } from "@/lib/validations/lesson"
import { Lesson } from "@/types/custom.types"

export function usePublishLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: PublishLessonInput) => {
      const result = await publishLesson(params)
      
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
        const updatedLesson = {
          ...previousLesson,
          is_published: variables.is_published,
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<Lesson>(["lessons", variables.id], updatedLesson)
        
        // Update in course lessons list
        queryClient.setQueryData<Lesson[]>(
          ["lessons", "by-course", previousLesson.course_id],
          (old) => {
            if (!old) return [updatedLesson]
            
            return old.map(lesson => 
              lesson.id === variables.id ? updatedLesson : lesson
            )
          }
        )
      }
      
      return { previousLesson }
    },
    onSuccess: (data) => {
      // Update the lesson cache with the server response
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

      // Custom toast messages based on publish status
      if (data.is_published) {
        toast.success("Bài học đã được xuất bản")
      } else {
        toast.success("Bài học đã được hủy xuất bản")
      }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLesson) {
        queryClient.setQueryData(["lessons", variables.id], context.previousLesson)
        
        // Also rollback in course lessons list
        const previousLesson = context.previousLesson
        queryClient.setQueryData<Lesson[]>(
          ["lessons", "by-course", previousLesson.course_id],
          (old) => {
            if (!old) return [previousLesson]
            
            return old.map(lesson => 
              lesson.id === variables.id ? previousLesson : lesson
            )
          }
        )
      }
      
      console.error("Publish lesson error:", error)
      toast.error(error.message)
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["lessons", variables.id] })
    },
  })
} 