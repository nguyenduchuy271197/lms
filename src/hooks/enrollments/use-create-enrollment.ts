"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createEnrollment } from "@/actions/enrollments/create-enrollment"
import { type CreateEnrollmentInput } from "@/lib/validations/enrollment"
import { EnrollmentWithDetails } from "@/types/custom.types"


export function useCreateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation<EnrollmentWithDetails, Error, CreateEnrollmentInput>({
    mutationFn: async (params) => {
      const result = await createEnrollment(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollments-by-course", data.course_id] })
      queryClient.invalidateQueries({ queryKey: ["check-enrollment", data.course_id] })
      
      // Update individual enrollment cache
      queryClient.setQueryData(["enrollment", data.id], data)
      
      const courseName = data.courses?.title || "khóa học"
      toast.success(`Đăng ký khóa học "${courseName}" thành công`)
    },
    onError: (error) => {
      console.error("Create enrollment error:", error)
      toast.error(error.message || "Đăng ký khóa học thất bại")
    },
  })
} 