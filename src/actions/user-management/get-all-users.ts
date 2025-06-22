'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  getAllUsersSchema,
  type GetAllUsersInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'
import type { Profile } from '@/types/custom.types'

export interface PaginatedUsersResponse {
  users: Profile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getAllUsers(
  input: GetAllUsersInput
): Promise<PaginatedUsersResponse> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = getAllUsersSchema.parse(input)
    
    const supabase = await createClient()
    
    // Build base query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
    
    // Add role filter if provided
    if (validatedInput.role) {
      query = query.eq('role', validatedInput.role)
    }
    
    // Add search filter if provided
    if (validatedInput.search) {
      const searchTerm = `%${validatedInput.search}%`
      query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
    }
    
    // Add pagination
    const offset = (validatedInput.page - 1) * validatedInput.limit
    query = query
      .range(offset, offset + validatedInput.limit - 1)
      .order('created_at', { ascending: false })
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error getting users:', error)
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    const total = count || 0
    const totalPages = Math.ceil(total / validatedInput.limit)
    
    return {
      users: data || [],
      total,
      page: validatedInput.page,
      limit: validatedInput.limit,
      totalPages,
    }
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    throw error instanceof Error ? error : new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
  }
} 