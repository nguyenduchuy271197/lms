"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategory } from "@/actions/categories/create-category"
import { LABELS } from "@/constants/labels"
import { Category } from "@/types/custom.types"
import type { CreateCategoryInput } from "@/lib/validations/category"
import { toast } from "sonner"

interface UseCreateCategoryOptions {
  onSuccess?: (data: Category) => void
  onError?: (error: string) => void
  showToast?: boolean
}

export function useCreateCategory(options: UseCreateCategoryOptions = {}) {
  const { onSuccess, onError, showToast = true } = options
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateCategoryInput) => {
      const result = await createCategory(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      
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