"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { changeUserRole } from "@/actions/users/change-role"
import { toast } from "sonner"

export function useChangeRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changeUserRole,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cập nhật vai trò thành công")
        // Invalidate any user-related queries
        queryClient.invalidateQueries({ queryKey: ["users"] })
        queryClient.invalidateQueries({ queryKey: ["profiles"] })
      } else {
        toast.error(result.error)
      }
    },
    onError: (error) => {
      toast.error("Cập nhật vai trò thất bại")
      console.error("Change role error:", error)
    },
  })
} 