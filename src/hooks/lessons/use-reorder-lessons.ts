"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { reorderLessons } from "@/actions/lessons/reorder-lessons"
import { type ReorderLessonsInput } from "@/lib/validations/lesson"
import { Lesson } from "@/types/custom.types"


export function useReorderLessons() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: ReorderLessonsInput) => {
      const result = await reorderLessons(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ["lessons", "by-course", variables.course_id] 
      })
      
      // Snapshot the previous value
      const previousLessons = queryClient.getQueryData<Lesson[]>(
        ["lessons", "by-course", variables.course_id]
      )
      
      // Optimistically update the lessons order
      if (previousLessons) {
        const updatedLessons = previousLessons.map(lesson => {
          const reorderInfo = variables.lessons.find(l => l.id === lesson.id)
          if (reorderInfo) {
            return {
              ...lesson,
              order_index: reorderInfo.order_index,
              updated_at: new Date().toISOString(),
            }
          }
          return lesson
        }).sort((a, b) => a.order_index - b.order_index)
        
        queryClient.setQueryData<Lesson[]>(
          ["lessons", "by-course", variables.course_id],
          updatedLessons
        )
        
        // Update individual lesson caches
        updatedLessons.forEach(lesson => {
          queryClient.setQueryData(["lessons", lesson.id], lesson)
        })
      }
      
      return { previousLessons }
    },
    onSuccess: (data, variables) => {
      // Update the course lessons cache with the server response
      queryClient.setQueryData(["lessons", "by-course", variables.course_id], data)
      
      // Update individual lesson caches
      data.forEach(lesson => {
        queryClient.setQueryData(["lessons", lesson.id], lesson)
      })

      toast.success("Thứ tự bài học đã được cập nhật")
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLessons) {
        queryClient.setQueryData(
          ["lessons", "by-course", variables.course_id], 
          context.previousLessons
        )
        
        // Also rollback individual lesson caches
        context.previousLessons.forEach(lesson => {
          queryClient.setQueryData(["lessons", lesson.id], lesson)
        })
      }
      
      console.error("Reorder lessons error:", error)
      toast.error(error.message)
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ["lessons", "by-course", variables.course_id] 
      })
      
      // Invalidate individual lesson caches
      if (data) {
        data.forEach(lesson => {
          queryClient.invalidateQueries({ queryKey: ["lessons", lesson.id] })
        })
      }
    },
  })
} 