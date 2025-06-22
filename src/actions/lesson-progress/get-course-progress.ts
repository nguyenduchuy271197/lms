'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId, isAdmin } from '@/lib/auth'
import { 
  getCourseProgressSchema,
  type GetCourseProgressInput 
} from '@/lib/validations/lesson-progress'
import { COURSE_ERRORS, AUTH_ERRORS, ENROLLMENT_ERRORS } from '@/constants/error-messages'

export interface CourseProgress {
  course_id: string
  student_id: string
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  last_watched_at: string | null
  enrollment_status: 'active' | 'completed' | 'dropped'
  enrolled_at: string
  completed_at: string | null
}

export async function getCourseProgress(
  input: GetCourseProgressInput
): Promise<CourseProgress> {
  try {
    // Validate input
    const validatedInput = getCourseProgressSchema.parse(input)
    
    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error(AUTH_ERRORS.LOGIN_REQUIRED)
    }
    
    // Determine target student ID
    const targetStudentId = validatedInput.student_id || userId
    
    // Check permissions - students can only see their own progress, admins can see any
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin && targetStudentId !== userId) {
      throw new Error(AUTH_ERRORS.FORBIDDEN)
    }
    
    const supabase = await createClient()
    
    // Check if student is enrolled in the course
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('status, enrolled_at, completed_at')
      .eq('student_id', targetStudentId)
      .eq('course_id', validatedInput.course_id)
      .single()
    
    if (enrollmentError || !enrollmentData) {
      throw new Error(ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND)
    }
    
    // Get total published lessons in the course
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', validatedInput.course_id)
      .eq('is_published', true)
    
    if (lessonsError) {
      console.error('Error getting lessons:', lessonsError)
      throw new Error(COURSE_ERRORS.COURSE_NOT_FOUND)
    }
    
    const totalLessons = lessonsData?.length || 0
    
    // Get completed lessons for the student
    const { data: progressData, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        id,
        completed_at,
        last_watched_at,
        lessons!inner (
          id,
          course_id
        )
      `)
      .eq('student_id', targetStudentId)
      .eq('lessons.course_id', validatedInput.course_id)
      .eq('lessons.is_published', true)
      .not('completed_at', 'is', null)
    
    if (progressError) {
      console.error('Error getting progress:', progressError)
      throw new Error(COURSE_ERRORS.COURSE_NOT_FOUND)
    }
    
    const completedLessons = progressData?.length || 0
    
    // Get last watched at timestamp
    const { data: lastWatchedData } = await supabase
      .from('lesson_progress')
      .select('last_watched_at')
      .eq('student_id', targetStudentId)
      .eq('lessons.course_id', validatedInput.course_id)
      .order('last_watched_at', { ascending: false })
      .limit(1)
      .single()
    
    // Calculate progress percentage
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    
    return {
      course_id: validatedInput.course_id,
      student_id: targetStudentId,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress_percentage: progressPercentage,
      last_watched_at: lastWatchedData?.last_watched_at || null,
      enrollment_status: enrollmentData.status,
      enrolled_at: enrollmentData.enrolled_at,
      completed_at: enrollmentData.completed_at,
    }
  } catch (error) {
    console.error('Error in getCourseProgress:', error)
    throw error instanceof Error ? error : new Error(COURSE_ERRORS.COURSE_NOT_FOUND)
  }
} 