import { useMutation } from '@tanstack/react-query'
import { exportCourses } from '@/actions/admin/courses/export-courses'
import { toast } from 'sonner'

export function useExportCourses() {
  return useMutation({
    mutationFn: exportCourses,
    onSuccess: (result) => {
      if (!result.success) {
        return
      }

      const { filename, format, total_records, data } = result.data

      // Create and trigger download
      let downloadData: string
      let mimeType: string

      switch (format) {
        case 'csv':
          downloadData = data as string
          mimeType = 'text/csv'
          break
        case 'json':
          downloadData = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
          break
        case 'xlsx':
          // For XLSX, data is returned as JSON and should be handled by a library like xlsx
          downloadData = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
          break
        default:
          downloadData = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
      }

      // Create blob and download
      const blob = new Blob([downloadData], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Xuất thành công ${total_records} khóa học`, {
        description: `File ${filename} đã được tải xuống`
      })
    },
    onError: (error: Error) => {
      console.error('Export courses error:', error)
      toast.error('Xuất dữ liệu thất bại', {
        description: error.message
      })
    },
  })
} 