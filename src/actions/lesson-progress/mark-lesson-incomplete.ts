'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId, isStudent } from '@/lib/auth'
import { 
  markLessonIncompleteSchema,
  type MarkLessonIncompleteInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS, AUTH_ERRORS, ENROLLMENT_ERRORS } from '@/constants/error-messages'
import type { LessonProgress } from '@/types/custom.types'

export async function markLessonIncomplete(
  input: MarkLessonIncompleteInput
): Promise<LessonProgress> {
  try {
    // Validate input
    const validatedInput = markLessonIncompleteSchema.parse(input)
    
    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error(AUTH_ERRORS.LOGIN_REQUIRED)
    }
    
    // Only students can mark lessons incomplete
    const userIsStudent = await isStudent()
    if (!userIsStudent) {
      throw new Error(AUTH_ERRORS.STUDENT_REQUIRED)
    }
    
    const supabase = await createClient()
    
    // Check if user is enrolled in the course that contains this lesson
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', validatedInput.lesson_id)
      .single()
    
    if (lessonError || !lessonData) {
      throw new Error(LESSON_ERRORS.LESSON_NOT_FOUND)
    }
    
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', userId)
      .eq('course_id', lessonData.course_id)
      .eq('status', 'active')
      .single()
    
    if (enrollmentError || !enrollmentData) {
      throw new Error(ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND)
    }
    
    // Check if lesson progress exists
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id, watched_seconds')
      .eq('student_id', userId)
      .eq('lesson_id', validatedInput.lesson_id)
      .single()
    
    if (!existingProgress) {
      throw new Error(LESSON_ERRORS.LESSON_NOT_FOUND)
    }
    
    // Update progress to mark as incomplete (remove completed_at)
    const { data, error } = await supabase
      .from('lesson_progress')
      .update({
        completed_at: null,
        last_watched_at: new Date().toISOString(),
      })
      .eq('id', existingProgress.id)
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
      .single()
    
    if (error) {
      console.error('Error marking lesson incomplete:', error)
      throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
    }
    
    if (!data) {
      throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
    }
    
    return data
  } catch (error) {
    console.error('Error in markLessonIncomplete:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
  }
} 