'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetStudentProgress } from '@/actions/admin/students/reset-student-progress'
import { type ResetStudentProgressInput } from '@/lib/validations/admin-student-management'
import { toast } from 'sonner'

export function useResetStudentProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: ResetStudentProgressInput) => {
      const result = await resetStudentProgress(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate all student-related queries for this student
      queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'details', data.student_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'progress', data.student_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'enrollments', data.student_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'analytics', data.student_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'learning-path', data.student_id]
      })
      
      // Also invalidate the all students list
      queryClient.invalidateQueries({
        queryKey: ['admin', 'students', 'all']
      })

      const { affected_items } = data
      const resetSummary = []
      
      if (affected_items.enrollments_reset > 0) {
        resetSummary.push(`${affected_items.enrollments_reset} ghi danh`)
      }
      if (affected_items.lessons_reset > 0) {
        resetSummary.push(`${affected_items.lessons_reset} bài học`)
      }

      toast.success(`Đã đặt lại tiến độ học tập thành công`, {
        description: `Đã xử lý: ${resetSummary.join(', ')}`
      })
    },
    onError: (error) => {
      console.error('Reset progress error:', error)
      
      if (error.message.includes('admin') || error.message.includes('quyền')) {
        toast.error('Bạn không có quyền thực hiện thao tác này')
      } else if (error.message.includes('xác nhận')) {
        toast.error('Vui lòng xác nhận việc đặt lại tiến độ')
      } else if (error.message.includes('Không tìm thấy')) {
        toast.error('Không tìm thấy học viên')
      } else if (error.message.includes('bắt buộc')) {
        toast.error('Thiếu thông tin bắt buộc', {
          description: error.message
        })
      } else {
        toast.error('Có lỗi xảy ra khi đặt lại tiến độ', {
          description: error.message
        })
      }
    }
  })
} 