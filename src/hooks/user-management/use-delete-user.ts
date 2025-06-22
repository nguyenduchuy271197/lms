'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteUser } from '@/actions/user-management/delete-user'
import type { DeleteUserInput } from '@/lib/validations/user-management'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; message: string }, Error, DeleteUserInput>({
    mutationFn: deleteUser,
    onSuccess: (data, variables) => {
      // Invalidate and refetch users lists
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // Remove the specific user from cache
      queryClient.removeQueries({ queryKey: ['users', 'byId', variables.id] })
      
      toast.success(data.message)
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Xóa người dùng thất bại')
    },
  })
} 