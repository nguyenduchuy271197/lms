'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { exportUserData, type ExportedUserData } from '@/actions/user-management/export-user-data'
import type { ExportUserDataInput } from '@/lib/validations/user-management'

export function useExportUserData() {
  return useMutation<ExportedUserData, Error, ExportUserDataInput>({
    mutationFn: exportUserData,
    onSuccess: (data) => {
      toast.success(`Đã xuất dữ liệu ${data.total_count} người dùng thành công`)
      
      // Create and download the data as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    onError: (error) => {
      console.error('Error exporting user data:', error)
      toast.error(error.message || 'Xuất dữ liệu người dùng thất bại')
    },
  })
} 