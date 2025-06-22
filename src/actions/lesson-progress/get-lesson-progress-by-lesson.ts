'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  getLessonProgressByLessonSchema,
  type GetLessonProgressByLessonInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS } from '@/constants/error-messages'
import type { LessonProgress } from '@/types/custom.types'

export async function getLessonProgressByLesson(
  input: GetLessonProgressByLessonInput
): Promise<LessonProgress[]> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = getLessonProgressByLessonSchema.parse(input)
    
    const supabase = await createClient()
    
    // Get all lesson progress for the lesson
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
      .eq('lesson_id', validatedInput.lesson_id)
      .order('last_watched_at', { ascending: false })
    
    if (error) {
      console.error('Error getting lesson progress by lesson:', error)
      throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getLessonProgressByLesson:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
  }
} 