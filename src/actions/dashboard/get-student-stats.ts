'use server'

import { createClient } from '@/lib/supabase/server'
import { getStudentDashboardStatsSchema, type GetStudentDashboardStatsInput } from '@/lib/validations/dashboard-analytics'
import { AUTH_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAuth } from '@/lib/auth'
// Types will be defined inline as needed

export interface StudentDashboardStats {
  overview: {
    total_enrollments: number
    active_enrollments: number
    completed_enrollments: number
    total_watch_time_seconds: number
    avg_progress_percentage: number
    certificates_earned: number
  }
  recent_activity: {
    recent_enrollments: Array<{
      id: string
      course_title: string
      course_slug: string
      enrolled_at: string
      progress_percentage: number
    }>
    recent_completions: Array<{
      id: string
      course_title: string
      course_slug: string
      completed_at: string
    }>
    recent_lessons: Array<{
      id: string
      lesson_title: string
      course_title: string
      course_slug: string
      watched_at: string
      progress_percentage: number
    }>
  }
  progress_trends: Array<{
    date: string
    lessons_completed: number
    watch_time_seconds: number
    courses_completed: number
  }>
  category_breakdown: Array<{
    category_name: string
    enrollments: number
    avg_progress: number
    completed: number
  }>
}

type Result = 
  | { success: true; data: StudentDashboardStats }
  | { success: false; error: string }

export async function getStudentDashboardStats(
  params: GetStudentDashboardStatsInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = getStudentDashboardStatsSchema.parse(params)
    const { student_id, period } = validatedData

    // Authentication check
    const user = await requireAuth()
    
    // Permission check - students can only view their own stats, admins can view any
    if (user.profile.role === 'student' && user.id !== student_id) {
      return { success: false, error: AUTH_ERRORS.FORBIDDEN }
    }

    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null
    
    if (period !== 'all') {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[period]
      
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }

    // Get overview stats
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          slug
        )
      `)
      .eq('student_id', student_id)
      .gte('enrolled_at', startDate?.toISOString() || '1970-01-01')

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Get lesson progress for watch time and progress calculation
    const { data: lessonProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        id,
        watched_seconds,
        completed_at,
        last_watched_at,
        lessons (
          id,
          title,
          course_id,
          courses (
            id,
            title,
            slug,
            categories (
              id,
              name
            )
          )
        )
      `)
      .eq('student_id', student_id)
      .gte('last_watched_at', startDate?.toISOString() || '1970-01-01')

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Calculate overview stats
    const totalEnrollments = enrollments?.length || 0
    const activeEnrollments = enrollments?.filter(e => e.status === 'active').length || 0
    const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0
    const totalWatchTime = lessonProgress?.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0) || 0
    
    // Calculate average progress
    let avgProgress = 0
    if (enrollments && enrollments.length > 0) {
      const progressPromises = enrollments.map(async (enrollment) => {
        const { data } = await supabase.rpc('calculate_course_progress', {
          p_student_id: student_id,
          p_course_id: enrollment.courses?.id
        })
        return data || 0
      })
      
      const progressResults = await Promise.all(progressPromises)
      avgProgress = progressResults.reduce((sum, progress) => sum + progress, 0) / progressResults.length
    }

    // Build recent activity
    const recentEnrollments = enrollments
      ?.sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        course_title: e.courses?.title || '',
        course_slug: e.courses?.slug || '',
        enrolled_at: e.enrolled_at,
        progress_percentage: 0 // Will be calculated separately if needed
      })) || []

    const recentCompletions = enrollments
      ?.filter(e => e.status === 'completed' && e.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        course_title: e.courses?.title || '',
        course_slug: e.courses?.slug || '',
        completed_at: e.completed_at!
      })) || []

    const recentLessons = lessonProgress
      ?.filter(lp => lp.last_watched_at)
      .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())
      .slice(0, 10)
      .map(lp => ({
        id: lp.id,
        lesson_title: lp.lessons?.title || '',
        course_title: lp.lessons?.courses?.title || '',
        course_slug: lp.lessons?.courses?.slug || '',
        watched_at: lp.last_watched_at,
        progress_percentage: 0 // Calculate based on watched_seconds vs duration
      })) || []

    // Build category breakdown
    const categoryMap = new Map<string, { enrollments: number; totalProgress: number; completed: number }>()
    
    for (const enrollment of enrollments || []) {
      const categoryName = 'Chưa phân loại' // Default category since we don't have category in enrollment
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { enrollments: 0, totalProgress: 0, completed: 0 })
      }
      
      const category = categoryMap.get(categoryName)!
      category.enrollments++
      if (enrollment.status === 'completed') {
        category.completed++
        category.totalProgress += 100
      }
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, stats]) => ({
      category_name: name,
      enrollments: stats.enrollments,
      avg_progress: stats.enrollments > 0 ? stats.totalProgress / stats.enrollments : 0,
      completed: stats.completed
    }))

    // Build progress trends (simplified for now)
    const progressTrends: StudentDashboardStats['progress_trends'] = [] // Would need more complex date grouping logic

    const result: StudentDashboardStats = {
      overview: {
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        total_watch_time_seconds: totalWatchTime,
        avg_progress_percentage: avgProgress,
        certificates_earned: completedEnrollments // Simplified
      },
      recent_activity: {
        recent_enrollments: recentEnrollments,
        recent_completions: recentCompletions,
        recent_lessons: recentLessons
      },
      progress_trends: progressTrends,
      category_breakdown: categoryBreakdown
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getStudentDashboardStats:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 