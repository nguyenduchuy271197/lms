'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth'
import { 
  getMyLessonProgressSchema,
  type GetMyLessonProgressInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS } from '@/constants/error-messages'
import type { LessonProgress } from '@/types/custom.types'

export async function getMyLessonProgress(
  input: GetMyLessonProgressInput
): Promise<LessonProgress[]> {
  try {
    // Validate input
    const validatedInput = getMyLessonProgressSchema.parse(input)
    
    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error(LESSON_ERRORS.LESSON_ACCESS_DENIED)
    }
    
    const supabase = await createClient()
    
    // Build query
    let query = supabase
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
        )
      `)
      .eq('student_id', userId)
      .order('last_watched_at', { ascending: false })
    
    // Add lesson filter if provided
    if (validatedInput.lesson_id) {
      query = query.eq('lesson_id', validatedInput.lesson_id)
    }
    
    // Add course filter if provided
    if (validatedInput.course_id) {
      query = query.eq('lessons.course_id', validatedInput.course_id)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error getting lesson progress:', error)
      throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getMyLessonProgress:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
  }
} 