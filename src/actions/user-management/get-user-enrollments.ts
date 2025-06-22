'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  getUserEnrollmentsSchema,
  type GetUserEnrollmentsInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS, ENROLLMENT_ERRORS } from '@/constants/error-messages'
import type { EnrollmentWithDetails } from '@/types/custom.types'

export async function getUserEnrollments(
  input: GetUserEnrollmentsInput
): Promise<EnrollmentWithDetails[]> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = getUserEnrollmentsSchema.parse(input)
    
    const supabase = await createClient()
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', validatedInput.id)
      .single()
    
    if (userError || !user) {
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    // Build query for user enrollments
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          slug,
          thumbnail_url,
          is_published,
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq('student_id', validatedInput.id)
      .order('enrolled_at', { ascending: false })
    
    // Add status filter if provided
    if (validatedInput.status) {
      query = query.eq('status', validatedInput.status)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error getting user enrollments:', error)
      throw new Error(ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND)
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getUserEnrollments:', error)
    throw error instanceof Error ? error : new Error(ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND)
  }
} 