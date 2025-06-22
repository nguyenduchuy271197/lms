"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadAvatar } from "@/actions/users/upload-avatar"
import { QUERY_KEYS } from "./use-profile"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.uploaded)
        // Update profile with new avatar
        queryClient.setQueryData(QUERY_KEYS.profile, result.data.profile)
      } else {
        toast.error(result.error)
      }
    },
    onError: (error) => {
      toast.error("Tải ảnh đại diện thất bại")
      console.error("Upload avatar error:", error)
    },
    onSettled: () => {
      // Always refetch profile after avatar upload
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile })
    },
  })
} 