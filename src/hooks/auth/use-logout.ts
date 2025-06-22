"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logoutUser, logoutAndRedirect } from "@/actions/auth/logout"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.logout)
        // Clear all queries on logout
        queryClient.clear()
      } else {
        toast.error(result.error)
      }
    },
    onError: (error) => {
      toast.error("Đăng xuất thất bại")
      console.error("Logout error:", error)
    },
  })
}

export function useLogoutWithRedirect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutAndRedirect,
    onMutate: () => {
      // Clear all queries before redirect
      queryClient.clear()
    },
    onError: (error) => {
      toast.error("Đăng xuất thất bại")
      console.error("Logout with redirect error:", error)
    },
  })
} 