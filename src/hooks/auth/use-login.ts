"use client"

import { useMutation } from "@tanstack/react-query"
import { loginUser } from "@/actions/auth/login"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"
import { useRouter } from "next/navigation"

interface UseLoginOptions {
  onSuccess?: () => void
  redirect?: string
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.login)
        
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
      toast.error("Đăng nhập thất bại")
      console.error("Login error:", error)
    },
  })
}