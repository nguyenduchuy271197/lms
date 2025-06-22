"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteEnrollment } from "@/actions/enrollments/delete-enrollment"
import { type DeleteEnrollmentInput } from "@/lib/validations/enrollment"
import { EnrollmentWithDetails } from "@/types/custom.types"

export function useDeleteEnrollment() {
  const queryClient = useQueryClient()

  return useMutation<string, Error, DeleteEnrollmentInput, {
    previousEnrollment?: EnrollmentWithDetails;
    previousMyEnrollments?: EnrollmentWithDetails[];
  }>({
    mutationFn: async (params) => {
      const result = await deleteEnrollment(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.message
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["enrollment", variables.id] })
      await queryClient.cancelQueries({ queryKey: ["my-enrollments"] })

      // Snapshot previous values
      const previousEnrollment = queryClient.getQueryData<EnrollmentWithDetails>(["enrollment", variables.id])
      const previousMyEnrollments = queryClient.getQueryData<EnrollmentWithDetails[]>(["my-enrollments"])

      // Optimistically remove enrollment from lists
      if (previousMyEnrollments) {
        const updatedEnrollments = previousMyEnrollments.filter(
          enrollment => enrollment.id !== variables.id
        )
        queryClient.setQueryData(["my-enrollments"], updatedEnrollments)
      }

      // Remove individual enrollment cache
      queryClient.removeQueries({ queryKey: ["enrollment", variables.id] })

      return { previousEnrollment, previousMyEnrollments }
    },
    onSuccess: (message, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] })
      
      // Also invalidate enrollments by course if we know the course_id
      const enrollment = queryClient.getQueryData<EnrollmentWithDetails>(["enrollment", variables.id])
      if (enrollment?.course_id) {
        queryClient.invalidateQueries({ queryKey: ["enrollments-by-course", enrollment.course_id] })
        queryClient.invalidateQueries({ queryKey: ["check-enrollment", enrollment.course_id] })
      }
      
      toast.success(message)
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousEnrollment) {
        queryClient.setQueryData(["enrollment", variables.id], context.previousEnrollment)
      }
      if (context?.previousMyEnrollments) {
        queryClient.setQueryData(["my-enrollments"], context.previousMyEnrollments)
      }

      console.error("Delete enrollment error:", error)
      toast.error(error.message || "Xóa đăng ký thất bại")
    },
  })
} 