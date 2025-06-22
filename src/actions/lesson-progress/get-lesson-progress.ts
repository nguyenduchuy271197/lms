'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId, isAdmin } from '@/lib/auth'
import { 
  getLessonProgressSchema,
  type GetLessonProgressInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS, AUTH_ERRORS } from '@/constants/error-messages'
import type { LessonProgress } from '@/types/custom.types'

export async function getLessonProgress(
  input: GetLessonProgressInput
): Promise<LessonProgress> {
  try {
    // Validate input
    const validatedInput = getLessonProgressSchema.parse(input)
    
    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error(AUTH_ERRORS.LOGIN_REQUIRED)
    }
    
    const supabase = await createClient()
    
    // Get lesson progress with related data
    const { data, error } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lessons (
          id,
          title,
          description,
          duration_seconds,
          order_index,
          course_id,
          courses (
            id,
            title,
            slug
          )
        ),
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('id', validatedInput.id)
      .single()
    
    if (error) {
      console.error('Error getting lesson progress:', error)
      throw new Error(LESSON_ERRORS.LESSON_NOT_FOUND)
    }
    
    if (!data) {
      throw new Error(LESSON_ERRORS.LESSON_NOT_FOUND)
    }
    
    // Check permissions - students can only see their own progress, admins can see all
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin && data.student_id !== userId) {
      throw new Error(LESSON_ERRORS.LESSON_ACCESS_DENIED)
    }
    
    return data
  } catch (error) {
    console.error('Error in getLessonProgress:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
  }
} 