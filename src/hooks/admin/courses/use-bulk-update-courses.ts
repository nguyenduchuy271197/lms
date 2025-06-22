import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkUpdateCourses } from '@/actions/admin/courses/bulk-update-courses'
import { toast } from 'sonner'

export function useBulkUpdateCourses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkUpdateCourses,
    onSuccess: (result) => {
      if (!result.success) {
        return
      }

      // Invalidate all admin courses queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      
      // Also invalidate regular courses queries since they might be affected
      queryClient.invalidateQueries({ queryKey: ['courses'] })

      // Show success message with details
      const { successful, failed, total_processed } = result.data
      if (failed === 0) {
        toast.success(`Cập nhật thành công ${successful}/${total_processed} khóa học`)
      } else {
        toast.warning(
          `Cập nhật hoàn tất: ${successful} thành công, ${failed} thất bại`,
          {
            description: `Xem chi tiết để biết thêm thông tin về các lỗi xảy ra`
          }
        )
      }
    },
    onError: (error: Error) => {
      console.error('Bulk update courses error:', error)
      toast.error('Cập nhật hàng loạt thất bại', {
        description: error.message
      })
    },
  })
} 