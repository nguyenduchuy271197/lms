"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateEnrollmentStatus } from "@/actions/enrollments/update-enrollment-status"
import { type UpdateEnrollmentStatusInput } from "@/lib/validations/enrollment"
import { EnrollmentWithDetails } from "@/types/custom.types"
import { LABELS } from "@/constants/labels"

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient()

  return useMutation<EnrollmentWithDetails, Error, UpdateEnrollmentStatusInput, {
    previousEnrollment?: EnrollmentWithDetails;
    previousMyEnrollments?: EnrollmentWithDetails[];
  }>({
    mutationFn: async (params) => {
      const result = await updateEnrollmentStatus(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["enrollment", variables.id] })
      await queryClient.cancelQueries({ queryKey: ["my-enrollments"] })

      // Snapshot previous values
      const previousEnrollment = queryClient.getQueryData<EnrollmentWithDetails>(["enrollment", variables.id])
      const previousMyEnrollments = queryClient.getQueryData<EnrollmentWithDetails[]>(["my-enrollments"])

      // Optimistically update enrollment
      if (previousEnrollment) {
        const optimisticEnrollment: EnrollmentWithDetails = {
          ...previousEnrollment,
          status: variables.status,
          completed_at: variables.status === "completed" ? new Date().toISOString() : null,
        }
        
        queryClient.setQueryData(["enrollment", variables.id], optimisticEnrollment)
        
        // Update my enrollments list
        if (previousMyEnrollments) {
          const updatedEnrollments = previousMyEnrollments.map(enrollment =>
            enrollment.id === variables.id ? optimisticEnrollment : enrollment
          )
          queryClient.setQueryData(["my-enrollments"], updatedEnrollments)
        }
      }

      return { previousEnrollment, previousMyEnrollments }
    },
    onSuccess: (data) => {
      // Update caches with server data
      queryClient.setQueryData(["enrollment", data.id], data)
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["enrollments-by-course", data.course_id] })

      const statusLabel = LABELS.ENROLLMENT_STATUS[data.status as keyof typeof LABELS.ENROLLMENT_STATUS] || data.status
      const courseName = data.courses?.title || "khóa học"
      
      toast.success(`Cập nhật trạng thái đăng ký "${courseName}" thành "${statusLabel}" thành công`)
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousEnrollment) {
        queryClient.setQueryData(["enrollment", variables.id], context.previousEnrollment)
      }
      if (context?.previousMyEnrollments) {
        queryClient.setQueryData(["my-enrollments"], context.previousMyEnrollments)
      }

      console.error("Update enrollment status error:", error)
      toast.error(error.message || "Cập nhật trạng thái đăng ký thất bại")
    },
  })
} 