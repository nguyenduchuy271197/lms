"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logoutUser } from "@/actions/auth/logout"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"
import { useRouter } from "next/navigation"

interface UseLogoutOptions {
  onSuccess?: () => void
  redirect?: string
}

export function useLogout(options?: UseLogoutOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (result) => {
      // Clear all queries on logout
      queryClient.clear()
      
      if (result.success) {
        toast.success(LABELS.SUCCESS.logout)
        
        // Handle redirect if specified
        if (options?.redirect) {
          router.push(options.redirect)
        }
        
        // Call custom onSuccess callback if provided
        options?.onSuccess?.()
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