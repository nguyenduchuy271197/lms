'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  updateUserProfileSchema,
  type UpdateUserProfileInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'
import type { Profile } from '@/types/custom.types'

export async function updateUserProfileAdmin(
  input: UpdateUserProfileInput
): Promise<Profile> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = updateUserProfileSchema.parse(input)
    
    const supabase = await createClient()
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', validatedInput.id)
      .single()
    
    if (checkError || !existingUser) {
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    // Check if email is being changed and if it already exists
    if (validatedInput.email && validatedInput.email !== existingUser.email) {
      const { data: emailCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validatedInput.email)
        .neq('id', validatedInput.id)
        .single()
      
      if (emailCheck) {
        throw new Error(AUTH_ERRORS.EMAIL_ALREADY_EXISTS)
      }
    }
    
    // Prepare update data
    const updateData: Partial<Profile> = {}
    
    if (validatedInput.full_name !== undefined) {
      updateData.full_name = validatedInput.full_name
    }
    
    if (validatedInput.email !== undefined) {
      updateData.email = validatedInput.email
    }
    
    if (validatedInput.role !== undefined) {
      updateData.role = validatedInput.role
    }
    
    // Update user profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', validatedInput.id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating user profile:', error)
      throw new Error(AUTH_ERRORS.PROFILE_UPDATE_FAILED)
    }
    
    if (!data) {
      throw new Error(AUTH_ERRORS.PROFILE_UPDATE_FAILED)
    }
    
    return data
  } catch (error) {
    console.error('Error in updateUserProfileAdmin:', error)
    throw error instanceof Error ? error : new Error(AUTH_ERRORS.PROFILE_UPDATE_FAILED)
  }
} 