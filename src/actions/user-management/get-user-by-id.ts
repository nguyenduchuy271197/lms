'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  getUserByIdSchema,
  type GetUserByIdInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'
import type { Profile } from '@/types/custom.types'

export async function getUserById(
  input: GetUserByIdInput
): Promise<Profile> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = getUserByIdSchema.parse(input)
    
    const supabase = await createClient()
    
    // Get user by ID
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', validatedInput.id)
      .single()
    
    if (error) {
      console.error('Error getting user by ID:', error)
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    if (!data) {
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserById:', error)
    throw error instanceof Error ? error : new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
  }
} 