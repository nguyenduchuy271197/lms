"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUserProfile } from "@/actions/users/update-profile"
import { QUERY_KEYS } from "./use-profile"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.profile })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(QUERY_KEYS.profile)

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData(QUERY_KEYS.profile, {
          ...previousProfile,
          ...variables,
        })
      }

      return { previousProfile }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.updated)
        // Update with actual data from server
        queryClient.setQueryData(QUERY_KEYS.profile, result.data)
      } else {
        toast.error(result.error)
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(QUERY_KEYS.profile, context.previousProfile)
      }
      toast.error("Cập nhật thông tin thất bại")
      console.error("Update profile error:", error)
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile })
    },
  })
} 