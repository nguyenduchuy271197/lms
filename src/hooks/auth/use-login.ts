"use client"

import { useMutation } from "@tanstack/react-query"
import { loginUser, loginAndRedirect } from "@/actions/auth/login"
import { toast } from "sonner"
import { LABELS } from "@/constants/labels"

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LABELS.SUCCESS.login)
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

export function useLoginWithRedirect() {
  return useMutation({
    mutationFn: loginAndRedirect,
    onError: (error) => {
      toast.error("Đăng nhập thất bại")
      console.error("Login with redirect error:", error)
    },
  })
} 