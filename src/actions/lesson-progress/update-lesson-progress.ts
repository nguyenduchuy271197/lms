'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId, isStudent } from '@/lib/auth'
import { 
  updateLessonProgressSchema,
  type UpdateLessonProgressInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS, AUTH_ERRORS, ENROLLMENT_ERRORS } from '@/constants/error-messages'
import type { LessonProgress } from '@/types/custom.types'

export async function updateLessonProgress(
  input: UpdateLessonProgressInput
): Promise<LessonProgress> {
  try {
    // Validate input
    const validatedInput = updateLessonProgressSchema.parse(input)
    
    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error(AUTH_ERRORS.LOGIN_REQUIRED)
    }
    
    // Only students can update their own progress
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
      .select('id')
      .eq('student_id', userId)
      .eq('lesson_id', validatedInput.lesson_id)
      .single()
    
    let result
    
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({
          watched_seconds: validatedInput.watched_seconds,
          completed_at: validatedInput.completed_at,
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
        console.error('Error updating lesson progress:', error)
        throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
      }
      
      result = data
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          student_id: userId,
          lesson_id: validatedInput.lesson_id,
          enrollment_id: enrollmentData.id,
          watched_seconds: validatedInput.watched_seconds,
          completed_at: validatedInput.completed_at,
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
        console.error('Error creating lesson progress:', error)
        throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
      }
      
      result = data
    }
    
    if (!result) {
      throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
    }
    
    return result
  } catch (error) {
    console.error('Error in updateLessonProgress:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
  }
}