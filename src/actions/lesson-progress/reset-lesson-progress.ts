'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  resetLessonProgressSchema,
  type ResetLessonProgressInput 
} from '@/lib/validations/lesson-progress'
import { LESSON_ERRORS } from '@/constants/error-messages'

export async function resetLessonProgress(
  input: ResetLessonProgressInput
): Promise<{ success: boolean; message: string }> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = resetLessonProgressSchema.parse(input)
    
    const supabase = await createClient()
    
    // Build delete query
    let query = supabase
      .from('lesson_progress')
      .delete()
      .eq('lesson_id', validatedInput.lesson_id)
    
    // Add student filter if provided
    if (validatedInput.student_id) {
      query = query.eq('student_id', validatedInput.student_id)
    }
    
    const { error, count } = await query
    
    if (error) {
      console.error('Error resetting lesson progress:', error)
      throw new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
    }
    
    const deletedCount = count || 0
    const message = validatedInput.student_id 
      ? `Đã xóa tiến độ bài học cho 1 học viên` 
      : `Đã xóa tiến độ bài học cho ${deletedCount} học viên`
    
    return {
      success: true,
      message,
    }
  } catch (error) {
    console.error('Error in resetLessonProgress:', error)
    throw error instanceof Error ? error : new Error(LESSON_ERRORS.LESSON_PROGRESS_UPDATE_FAILED)
  }
} 