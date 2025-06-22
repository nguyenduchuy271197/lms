"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateCategory } from "@/actions/categories/update-category"
import { LABELS } from "@/constants/labels"
import { Category } from "@/types/custom.types"
import type { UpdateCategoryInput } from "@/lib/validations/category"
import { toast } from "sonner"

interface UseUpdateCategoryOptions {
  onSuccess?: (data: Category) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useUpdateCategory(options: UseUpdateCategoryOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateCategoryInput) => {
      const result = await updateCategory(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (params: UpdateCategoryInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["categories"] })
      await queryClient.cancelQueries({ queryKey: ["category", params.id] })

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>(["categories"])
      const previousCategory = queryClient.getQueryData<Category>(["category", params.id])

      // Optimistically update to the new value
      if (previousCategories) {
        queryClient.setQueryData<Category[]>(["categories"], (old) =>
          old ? old.map(cat => 
            cat.id === params.id 
              ? { ...cat, ...params, updated_at: new Date().toISOString() }
              : cat
          ) : []
        )
      }

      if (previousCategory) {
        queryClient.setQueryData<Category>(["category", params.id], (old) =>
          old ? { ...old, ...params, updated_at: new Date().toISOString() } : old
        )
      }

      // Return a context object with the snapshotted value
      return { previousCategories, previousCategory }
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData<Category[]>(["categories"], (old) =>
        old ? old.map(cat => cat.id === data.id ? data : cat) : []
      )
      queryClient.setQueryData<Category>(["category", data.id], data)
      
      if (showToast) {
        toast.success(LABELS.SUCCESS.updated)
      }
      
      onSuccess?.(data)
    },
    onError: (error: Error, params, context) => {
      // Rollback optimistic updates
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories)
      }
      if (context?.previousCategory) {
        queryClient.setQueryData(["category", params.id], context.previousCategory)
      }
      
      if (showToast) {
        toast.error(error.message)
      }
      
      onError?.(error.message)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
} 