'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { resetStudentProgressSchema, type ResetStudentProgressInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

interface ResetProgressResult {
  student_id: string
  student_name: string | null
  reset_type: 'all' | 'course' | 'lesson'
  affected_items: {
    enrollments_reset: number
    lessons_reset: number
  }
  reset_date: string
}

type Result = 
  | { success: true; data: ResetProgressResult }
  | { success: false; error: string }

export async function resetStudentProgress(params: ResetStudentProgressInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = resetStudentProgressSchema.parse(params)
    const { student_id, reset_type, course_id, lesson_id, confirm } = validatedParams

    // Check admin permissions
    await requireAdmin()

    // Safety check - require explicit confirmation
    if (!confirm) {
      return { success: false, error: 'Vui lòng xác nhận việc đặt lại tiến độ' }
    }

    const supabase = await createClient()

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: 'Không tìm thấy học viên' }
    }

    let enrollmentsReset = 0
    let lessonsReset = 0

    // Perform reset based on type
    switch (reset_type) {
      case 'all':
        const allResult = await resetAllProgress(supabase, student_id)
        enrollmentsReset = allResult.enrollmentsReset
        lessonsReset = allResult.lessonsReset
        break

      case 'course':
        if (!course_id) {
          return { success: false, error: 'Course ID là bắt buộc khi đặt lại tiến độ khóa học' }
        }
        const courseResult = await resetCourseProgress(supabase, student_id, course_id)
        enrollmentsReset = courseResult.enrollmentsReset
        lessonsReset = courseResult.lessonsReset
        break

      case 'lesson':
        if (!lesson_id) {
          return { success: false, error: 'Lesson ID là bắt buộc khi đặt lại tiến độ bài học' }
        }
        const lessonResult = await resetLessonProgress(supabase, student_id, lesson_id)
        lessonsReset = lessonResult.lessonsReset
        break

      default:
        return { success: false, error: 'Phạm vi đặt lại không hợp lệ' }
    }

    return {
      success: true,
      data: {
        student_id,
        student_name: student.full_name,
        reset_type,
        affected_items: {
          enrollments_reset: enrollmentsReset,
          lessons_reset: lessonsReset
        },
        reset_date: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Error in resetStudentProgress:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}



async function resetAllProgress(supabase: SupabaseClient<Database>, studentId: string) {
  let enrollmentsReset = 0
  let lessonsReset = 0

  try {
    // Reset all lesson progress
    const { data: lessonProgressData, error: lessonProgressError } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('student_id', studentId)
      .select()

    if (lessonProgressError) {
      console.error('Error resetting lesson progress:', lessonProgressError)
    } else {
      lessonsReset = lessonProgressData?.length || 0
    }

    // Reset enrollments (set status to active, remove completion dates)
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        status: 'active',
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .select()

    if (enrollmentError) {
      console.error('Error resetting enrollments:', enrollmentError)
    } else {
      enrollmentsReset = enrollmentData?.length || 0
    }

  } catch (error) {
    console.error('Error in resetAllProgress:', error)
  }

  return { enrollmentsReset, lessonsReset }
}

async function resetCourseProgress(supabase: SupabaseClient<Database>, studentId: string, courseId: string) {
  let enrollmentsReset = 0
  let lessonsReset = 0

  try {
    // Get all lessons for this course
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)

    const lessonIds = courseLessons?.map(l => l.id) || []

    if (lessonIds.length > 0) {
      // Reset lesson progress for this course
      const { data: lessonProgressData, error: lessonProgressError } = await supabase
        .from('lesson_progress')
        .delete()
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds)
        .select()

      if (lessonProgressError) {
        console.error('Error resetting course lesson progress:', lessonProgressError)
      } else {
        lessonsReset = lessonProgressData?.length || 0
      }
    }

    // Reset enrollment for this course
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        status: 'active',
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .select()

    if (enrollmentError) {
      console.error('Error resetting course enrollment:', enrollmentError)
    } else {
      enrollmentsReset = enrollmentData?.length || 0
    }

  } catch (error) {
    console.error('Error in resetCourseProgress:', error)
  }

  return { enrollmentsReset, lessonsReset }
}

async function resetLessonProgress(supabase: SupabaseClient<Database>, studentId: string, lessonId: string) {
  let lessonsReset = 0

  try {
    // Reset specific lesson progress
    const { data: lessonProgressData, error: lessonProgressError } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .select()

    if (lessonProgressError) {
      console.error('Error resetting lesson progress:', lessonProgressError)
    } else {
      lessonsReset = lessonProgressData?.length || 0
    }

    // Update course enrollment status if needed
    // Get the course for this lesson
    const { data: lesson } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single()

    if (lesson) {
      // Check if there are any remaining completed lessons in this course
      const { data: remainingProgress } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', studentId)
        .not('completed_at', 'is', null)
        .in('lesson_id',
          (await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', lesson.course_id)
          ).data?.map(l => l.id) || []
        )

      // If no lessons are completed, update enrollment status
      if (!remainingProgress || remainingProgress.length === 0) {
        await supabase
          .from('enrollments')
          .update({
            status: 'active',
            completed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('student_id', studentId)
          .eq('course_id', lesson.course_id)
      }
    }

  } catch (error) {
    console.error('Error in resetLessonProgress:', error)
  }

  return { lessonsReset }
} 