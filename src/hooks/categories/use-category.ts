"use client"

import { useQuery } from "@tanstack/react-query"
import { getCategory } from "@/actions/categories/get-category"
import { Category } from "@/types/custom.types"
import type { GetCategoryInput } from "@/lib/validations/category"

interface UseCategoryOptions {
  enabled?: boolean
}

export function useCategory(params: GetCategoryInput, options: UseCategoryOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["category", params.id],
    queryFn: async (): Promise<Category> => {
      const result = await getCategory(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: enabled && !!params.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors or not found errors
      if (error instanceof Error && 
          (error.message.includes("không hợp lệ") || 
           error.message.includes("Không tìm thấy"))) {
        return false
      }
      return failureCount < 3
    },
  })
} 