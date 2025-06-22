"use client"

import { useMutation } from "@tanstack/react-query"
import { registerUser, registerAndRedirect } from "@/actions/auth/register"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.registered)
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

export function useRegisterWithRedirect() {
  return useMutation({
    mutationFn: registerAndRedirect,
    onError: (error) => {
      toast.error("Đăng ký thất bại")
      console.error("Register with redirect error:", error)
    },
  })
} 