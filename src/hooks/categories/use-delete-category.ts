"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCategory } from "@/actions/categories/delete-category"
import { LABELS } from "@/constants/labels"
import { Category } from "@/types/custom.types"
import type { DeleteCategoryInput } from "@/lib/validations/category"
import { toast } from "sonner"

interface UseDeleteCategoryOptions {
  onSuccess?: (data: { id: string }) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useDeleteCategory(options: UseDeleteCategoryOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteCategoryInput) => {
      const result = await deleteCategory(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (params: DeleteCategoryInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["categories"] })
      await queryClient.cancelQueries({ queryKey: ["category", params.id] })

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>(["categories"])
      const previousCategory = queryClient.getQueryData<Category>(["category", params.id])

      // Optimistically update to the new value
      if (previousCategories) {
        queryClient.setQueryData<Category[]>(["categories"], (old) =>
          old ? old.filter(cat => cat.id !== params.id) : []
        )
      }

      // Remove individual category from cache
      queryClient.removeQueries({ queryKey: ["category", params.id] })

      // Return a context object with the snapshotted value
      return { previousCategories, previousCategory }
    },
    onSuccess: (data) => {
      // Ensure the category is removed from all caches
      queryClient.setQueryData<Category[]>(["categories"], (old) =>
        old ? old.filter(cat => cat.id !== data.id) : []
      )
      queryClient.removeQueries({ queryKey: ["category", data.id] })
      
      if (showToast) {
        toast.success(LABELS.SUCCESS.deleted)
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