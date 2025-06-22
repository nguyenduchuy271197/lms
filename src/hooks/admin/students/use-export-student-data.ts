'use client'

import { useMutation } from '@tanstack/react-query'
import { exportStudentData } from '@/actions/admin/students/export-student-data'
import { type ExportStudentDataInput } from '@/lib/validations/admin-student-management'
import { toast } from 'sonner'

export function useExportStudentData() {

  return useMutation({
    mutationFn: async (params: ExportStudentDataInput) => {
      const result = await exportStudentData(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Create and trigger file download
      const blob = new Blob([data.file_content], { type: data.mime_type })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = data.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      URL.revokeObjectURL(url)
      
      toast.success(`Đã xuất dữ liệu ${data.total_students} học viên thành công`, {
        description: `File: ${data.file_name}`
      })
    },
    onError: (error) => {
      console.error('Export error:', error)
      
      if (error.message.includes('admin') || error.message.includes('quyền')) {
        toast.error('Bạn không có quyền thực hiện thao tác này')
      } else if (error.message.includes('Không tìm thấy')) {
        toast.error('Không tìm thấy dữ liệu học viên để xuất')
      } else {
        toast.error('Có lỗi xảy ra khi xuất dữ liệu', {
          description: error.message
        })
      }
    }
  })
} 