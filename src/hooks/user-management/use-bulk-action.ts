'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bulkAction, type BulkActionResult } from '@/actions/user-management/bulk-action'
import type { BulkActionInput } from '@/lib/validations/user-management'

export function useBulkAction() {
  const queryClient = useQueryClient()

  return useMutation<BulkActionResult, Error, BulkActionInput>({
    mutationFn: bulkAction,
    onSuccess: (data, variables) => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Remove specific users from cache if they were deleted
      if (variables.action === 'delete') {
        variables.user_ids.forEach(userId => {
          queryClient.removeQueries({ queryKey: ['users', 'byId', userId] })
        })
      }
      
      // Show appropriate toast message
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.warning(data.message)
      }
      
      // Show additional info if there were failures
      if (data.failed_users.length > 0) {
        toast.error(`${data.failed_users.length} người dùng không thể xử lý`)
      }
    },
    onError: (error) => {
      console.error('Error in bulk action:', error)
      toast.error(error.message || 'Thao tác hàng loạt thất bại')
    },
  })
} 