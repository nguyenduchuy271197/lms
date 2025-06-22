'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId, isStudent } from '@/lib/auth'
import { 
  markLessonCompleteSchema,
  type MarkLessonCompleteInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS, AUTH_ERRORS, ENROLLMENT_ERRORS } from '@/constants/error-messages'
import type { LessonProgress } from '@/types/custom.types'

export async function markLessonComplete(
  input: MarkLessonCompleteInput
): Promise<LessonProgress> {
  try {
    // Validate input
    const validatedInput = markLessonCompleteSchema.parse(input)
    
    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error(AUTH_ERRORS.LOGIN_REQUIRED)
    }
    
    // Only students can mark lessons complete
    const userIsStudent = await isStudent()
    if (!userIsStudent) {
      throw new Error(AUTH_ERRORS.STUDENT_REQUIRED)
    }
    
    const supabase = await createClient()
    
    // Check if user is enrolled in the course that contains this lesson
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id, duration_seconds')
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
    
    // Use provided watched_seconds or default to lesson duration
    const watchedSeconds = validatedInput.watched_seconds ?? lessonData.duration_seconds ?? 0
    
    // Check if lesson progress exists
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('student_id', userId)
      .eq('lesson_id', validatedInput.lesson_id)
      .single()
    
    let result
    
    if (existingProgress) {
      // Update existing progress to mark as complete
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          watched_seconds: watchedSeconds,
          completed_at: new Date().toISOString(),
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
        console.error('Error marking lesson complete:', error)
        throw new Error(LESSON_ERRORS.LESSON_COMPLETION_FAILED)
      }
      
      result = data
    } else {
      // Create new progress and mark as complete
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          student_id: userId,
          lesson_id: validatedInput.lesson_id,
          enrollment_id: enrollmentData.id,
          watched_seconds: watchedSeconds,
          completed_at: new Date().toISOString(),
          last_watched_at: new Date().toISOString(),
        })
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
        console.error('Error marking lesson complete:', error)
        throw new Error(LESSON_ERRORS.LESSON_COMPLETION_FAILED)
      }
      
      result = data
    }
    
    if (!result) {
      throw new Error(LESSON_ERRORS.LESSON_COMPLETION_FAILED)
    }
    
    return result
  } catch (error) {
    console.error('Error in markLessonComplete:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_COMPLETION_FAILED)
  }
} 