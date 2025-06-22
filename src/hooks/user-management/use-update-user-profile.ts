'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateUserProfileAdmin } from '@/actions/user-management/update-user-profile'
import type { UpdateUserProfileInput } from '@/lib/validations/user-management'
import type { Profile } from '@/types/custom.types'

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation<Profile, Error, UpdateUserProfileInput>({
    mutationFn: updateUserProfileAdmin,
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'byId', variables.id] })
      
      // Update the specific user cache
      queryClient.setQueryData(['users', 'byId', variables.id], data)
      
      toast.success('Cập nhật thông tin người dùng thành công')
    },
    onError: (error) => {
      console.error('Error updating user profile:', error)
      toast.error(error.message || 'Cập nhật thông tin người dùng thất bại')
    },
  })
} 