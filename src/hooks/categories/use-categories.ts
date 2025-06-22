"use client"

import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/actions/categories/get-categories"
import { Category } from "@/types/custom.types"

interface UseCategoriesOptions {
  enabled?: boolean
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const result = await getCategories()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes("không hợp lệ")) {
        return false
      }
      return failureCount < 3
    },
  })
} 