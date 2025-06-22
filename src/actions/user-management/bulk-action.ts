'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  bulkActionSchema,
  type BulkActionInput 
} from '@/lib/validations/user-management'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export interface BulkActionResult {
  success: boolean
  message: string
  affected_count: number
  failed_users: string[]
}

export async function bulkAction(
  input: BulkActionInput
): Promise<BulkActionResult> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = bulkActionSchema.parse(input)
    
    const supabase = await createClient()
    
    switch (validatedInput.action) {
      case 'delete':
        return await handleBulkDelete(supabase, validatedInput.user_ids)
      
      case 'change_role':
        if (!validatedInput.role) {
          throw new Error('Vai trò là bắt buộc cho hành động thay đổi vai trò')
        }
        return await handleBulkRoleChange(supabase, validatedInput.user_ids, validatedInput.role)
      
      default:
        throw new Error('Hành động không được hỗ trợ')
    }
  } catch (error) {
    console.error('Error in bulkAction:', error)
    throw error instanceof Error ? error : new Error('Thao tác hàng loạt thất bại')
  }
}

async function handleBulkDelete(
  supabase: SupabaseClient<Database>,
  userIds: string[]
): Promise<BulkActionResult> {
  const failedUsers: string[] = []
  let affectedCount = 0
  
  // Check for admins and prevent deleting the last admin
  const { data: adminCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role', 'admin')
  
  const { data: adminsToDelete } = await supabase
    .from('profiles')
    .select('id')
    .in('id', userIds)
    .eq('role', 'admin')
  
  const adminsToDeleteCount = adminsToDelete?.length || 0
  const totalAdmins = adminCount?.length || 0
  
  if (totalAdmins - adminsToDeleteCount < 1) {
    throw new Error('Không thể xóa tất cả admin. Phải giữ lại ít nhất 1 admin trong hệ thống')
  }
  
  // Delete users one by one to handle individual failures
  for (const userId of userIds) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (error) {
        failedUsers.push(userId)
      } else {
        affectedCount++
      }
    } catch {
      failedUsers.push(userId)
    }
  }
  
  return {
    success: failedUsers.length === 0,
    message: `Đã xóa ${affectedCount} người dùng${failedUsers.length > 0 ? `, ${failedUsers.length} thất bại` : ''}`,
    affected_count: affectedCount,
    failed_users: failedUsers,
  }
}

async function handleBulkRoleChange(
  supabase: SupabaseClient<Database>,
  userIds: string[],
  newRole: 'student' | 'admin'
): Promise<BulkActionResult> {
  const failedUsers: string[] = []
  let affectedCount = 0
  
  // If changing from admin to student, check we don't remove all admins
  if (newRole === 'student') {
    const { data: adminCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin')
    
    const { data: adminsToChange } = await supabase
      .from('profiles')
      .select('id')
      .in('id', userIds)
      .eq('role', 'admin')
    
    const adminsToChangeCount = adminsToChange?.length || 0
    const totalAdmins = adminCount?.length || 0
    
    if (totalAdmins - adminsToChangeCount < 1) {
      throw new Error('Không thể chuyển tất cả admin thành học viên. Phải giữ lại ít nhất 1 admin trong hệ thống')
    }
  }
  
  // Update roles one by one to handle individual failures
  for (const userId of userIds) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) {
        failedUsers.push(userId)
      } else {
        affectedCount++
      }
    } catch {
      failedUsers.push(userId)
    }
  }
  
  const roleLabel = newRole === 'admin' ? 'quản trị viên' : 'học viên'
  
  return {
    success: failedUsers.length === 0,
    message: `Đã chuyển ${affectedCount} người dùng thành ${roleLabel}${failedUsers.length > 0 ? `, ${failedUsers.length} thất bại` : ''}`,
    affected_count: affectedCount,
    failed_users: failedUsers,
  }
} 