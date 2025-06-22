'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  deleteUserSchema,
  type DeleteUserInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'

export async function deleteUser(
  input: DeleteUserInput
): Promise<{ success: boolean; message: string }> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = deleteUserSchema.parse(input)
    
    const supabase = await createClient()
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', validatedInput.id)
      .single()
    
    if (checkError || !existingUser) {
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    // Prevent deleting the last admin
    if (existingUser.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin')
      
      if ((adminCount?.length || 0) <= 1) {
        throw new Error('Không thể xóa admin cuối cùng trong hệ thống')
      }
    }
    
    // Delete user profile (this will cascade delete related data due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', validatedInput.id)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw new Error('Xóa người dùng thất bại')
    }
    
    return {
      success: true,
      message: `Đã xóa người dùng ${existingUser.full_name || 'không tên'} thành công`,
    }
  } catch (error) {
    console.error('Error in deleteUser:', error)
    throw error instanceof Error ? error : new Error('Xóa người dùng thất bại')
  }
} 