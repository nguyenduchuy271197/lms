"use client"

import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/actions/auth/register"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"
import { useRouter } from "next/navigation"

interface UseRegisterOptions {
  onSuccess?: () => void
  redirect?: string
}

export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.registered)
        
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
      toast.error("Đăng ký thất bại")
      console.error("Register error:", error)
    },
  })
}