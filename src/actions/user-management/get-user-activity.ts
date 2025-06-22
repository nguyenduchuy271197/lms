'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  getUserActivitySchema,
  type GetUserActivityInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'

export interface UserActivity {
  user_id: string
  total_lessons_watched: number
  total_watch_time_seconds: number
  completed_lessons: number
  active_enrollments: number
  completed_enrollments: number
  last_activity_at: string | null
  recent_progress: Array<{
    lesson_id: string
    lesson_title: string
    course_title: string
    watched_seconds: number
    completed_at: string | null
    last_watched_at: string
  }>
}

export async function getUserActivity(
  input: GetUserActivityInput
): Promise<UserActivity> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = getUserActivitySchema.parse(input)
    
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
    
    // Calculate date range
    const now = new Date()
    const startDate = new Date(now.getTime() - validatedInput.days * 24 * 60 * 60 * 1000)
    
    // Get lesson progress data
    const { data: lessonProgress } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lessons (
          id,
          title,
          courses (
            id,
            title
          )
        )
      `)
      .eq('student_id', validatedInput.id)
      .gte('last_watched_at', startDate.toISOString())
      .order('last_watched_at', { ascending: false })
    
    // Get enrollment data
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, status, enrolled_at')
      .eq('student_id', validatedInput.id)
    
    // Calculate statistics
    const totalLessonsWatched = lessonProgress?.length || 0
    const totalWatchTimeSeconds = lessonProgress?.reduce((sum, p) => sum + (p.watched_seconds || 0), 0) || 0
    const completedLessons = lessonProgress?.filter(p => p.completed_at).length || 0
    const activeEnrollments = enrollments?.filter(e => e.status === 'active').length || 0
    const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0
    
    // Get last activity timestamp
    const lastActivityAt = lessonProgress?.[0]?.last_watched_at || null
    
    // Format recent progress data
    const recentProgress = (lessonProgress || []).slice(0, 10).map(p => ({
      lesson_id: p.lesson_id,
      lesson_title: p.lessons?.title || 'Bài học không tên',
      course_title: p.lessons?.courses?.title || 'Khóa học không tên',
      watched_seconds: p.watched_seconds || 0,
      completed_at: p.completed_at,
      last_watched_at: p.last_watched_at,
    }))
    
    return {
      user_id: validatedInput.id,
      total_lessons_watched: totalLessonsWatched,
      total_watch_time_seconds: totalWatchTimeSeconds,
      completed_lessons: completedLessons,
      active_enrollments: activeEnrollments,
      completed_enrollments: completedEnrollments,
      last_activity_at: lastActivityAt,
      recent_progress: recentProgress,
    }
  } catch (error) {
    console.error('Error in getUserActivity:', error)
    throw error instanceof Error ? error : new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
  }
} 