'use server'

import { createClient } from '@/lib/supabase/server'
import { getCourseDashboardStatsSchema, type GetCourseDashboardStatsInput } from '@/lib/validations/dashboard-analytics'
import { AUTH_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAuth } from '@/lib/auth'

export interface CourseDashboardStats {
  overview: {
    course_id: string
    course_title: string
    course_slug: string
    category_name: string
    total_lessons: number
    total_enrollments: number
    active_enrollments: number
    completed_enrollments: number
    completion_rate: number
    avg_progress: number
    total_watch_time_hours: number
    avg_lesson_completion_time: number
  }
  lesson_breakdown: Array<{
    lesson_id: string
    lesson_title: string
    order_index: number
    completion_count: number
    completion_rate: number
    avg_watch_time_seconds: number
    avg_completion_time_days: number
    drop_off_rate: number
  }>
  student_progress: Array<{
    student_id: string
    student_name: string
    student_email: string
    enrollment_date: string
    progress_percentage: number
    lessons_completed: number
    last_activity: string
    status: string
    time_spent_hours: number
  }>
  engagement_trends: Array<{
    date: string
    new_enrollments: number
    active_students: number
    lessons_completed: number
    avg_watch_time_minutes: number
  }>
  performance_metrics: {
    retention_rate: number
    avg_time_to_completion_days: number
    most_challenging_lesson: string
    highest_drop_off_lesson: string
    peak_activity_hour: number
    satisfaction_score: number
  }
}

type Result = 
  | { success: true; data: CourseDashboardStats }
  | { success: false; error: string }

export async function getCourseDashboardStats(
  params: GetCourseDashboardStatsInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = getCourseDashboardStatsSchema.parse(params)
    const { course_id, period, include_student_details, include_lesson_breakdown } = validatedData

    // Authentication check
    const user = await requireAuth()

    const supabase = await createClient()

    // Check if course exists and user has permission to view it
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        is_published,
        categories (
          id,
          name
        )
      `)
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return { success: false, error: 'Không tìm thấy khóa học' }
    }

    // Permission check - only admins or enrolled students can view course stats
    if (user.profile.role === 'student') {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course_id)
        .single()

      if (!enrollment) {
        return { success: false, error: AUTH_ERRORS.FORBIDDEN }
      }
    }

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

    // Get course enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_id,
        status,
        enrolled_at,
        completed_at,
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('course_id', course_id)
      .gte('enrolled_at', startDate?.toISOString() || '1970-01-01')

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Get course lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, order_index, duration_seconds')
      .eq('course_id', course_id)
      .eq('is_published', true)
      .order('order_index')

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Get lesson progress for all students in this course
    const { data: lessonProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        id,
        student_id,
        lesson_id,
        watched_seconds,
        completed_at,
        last_watched_at,
        lessons (
          id,
          title,
          order_index
        )
      `)
      .in('lesson_id', lessons?.map(l => l.id) || [])
      .gte('last_watched_at', startDate?.toISOString() || '1970-01-01')

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Calculate overview stats
    const totalLessons = lessons?.length || 0
    const totalEnrollments = enrollments?.length || 0
    const activeEnrollments = enrollments?.filter(e => e.status === 'active').length || 0
    const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0
    
    const totalWatchTimeSeconds = lessonProgress?.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0) || 0
    const totalWatchTimeHours = Math.round(totalWatchTimeSeconds / 3600 * 100) / 100

    // Calculate average progress
    let avgProgress = 0
    if (enrollments && enrollments.length > 0) {
      const progressPromises = enrollments.map(async (enrollment) => {
        const { data } = await supabase.rpc('calculate_course_progress', {
          p_student_id: enrollment.student_id,
          p_course_id: course_id
        })
        return data || 0
      })
      
      const progressResults = await Promise.all(progressPromises)
      avgProgress = progressResults.reduce((sum, progress) => sum + progress, 0) / progressResults.length
    }

    // Build lesson breakdown
    const lessonBreakdown = (lessons || []).map(lesson => {
      const lessonProgressData = lessonProgress?.filter(lp => lp.lesson_id === lesson.id) || []
      const completionCount = lessonProgressData.filter(lp => lp.completed_at).length
      const lessonCompletionRate = totalEnrollments > 0 ? (completionCount / totalEnrollments) * 100 : 0
      const avgWatchTime = lessonProgressData.length > 0 
        ? lessonProgressData.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0) / lessonProgressData.length 
        : 0

      return {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        order_index: lesson.order_index,
        completion_count: completionCount,
        completion_rate: Math.round(lessonCompletionRate * 100) / 100,
        avg_watch_time_seconds: Math.round(avgWatchTime),
        avg_completion_time_days: 0, // Would need enrollment date calculation
        drop_off_rate: 0 // Would need sequential lesson analysis
      }
    })

    // Build student progress (if requested and user is admin)
    const studentProgress = (include_student_details && user.profile.role === 'admin') 
      ? await Promise.all((enrollments || []).map(async (enrollment) => {
          const { data: progress } = await supabase.rpc('calculate_course_progress', {
            p_student_id: enrollment.student_id,
            p_course_id: course_id
          })
          
          const studentLessonProgress = lessonProgress?.filter(lp => lp.student_id === enrollment.student_id) || []
          const lessonsCompleted = studentLessonProgress.filter(lp => lp.completed_at).length
          const timeSpentSeconds = studentLessonProgress.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0)
          const lastActivity = studentLessonProgress
            .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())[0]?.last_watched_at || enrollment.enrolled_at

          return {
            student_id: enrollment.student_id,
            student_name: enrollment.profiles?.full_name || 'Chưa cập nhật',
            student_email: enrollment.profiles?.email || '',
            enrollment_date: enrollment.enrolled_at,
            progress_percentage: Math.round((progress || 0) * 100) / 100,
            lessons_completed: lessonsCompleted,
            last_activity: lastActivity,
            status: enrollment.status,
            time_spent_hours: Math.round(timeSpentSeconds / 3600 * 100) / 100
          }
        }))
      : []

    // Build engagement trends (simplified)
    const engagementTrends: CourseDashboardStats['engagement_trends'] = []

    // Build performance metrics (simplified)
    const performanceMetrics = {
      retention_rate: totalEnrollments > 0 ? ((totalEnrollments - enrollments?.filter(e => e.status === 'dropped').length || 0) / totalEnrollments) * 100 : 0,
      avg_time_to_completion_days: 0, // Would need completion date analysis
      most_challenging_lesson: lessonBreakdown.sort((a, b) => a.completion_rate - b.completion_rate)[0]?.lesson_title || '',
      highest_drop_off_lesson: '', // Would need sequential analysis
      peak_activity_hour: 14, // Default to 2 PM
      satisfaction_score: 0 // Would need rating system
    }

    const result: CourseDashboardStats = {
      overview: {
        course_id: course.id,
        course_title: course.title,
        course_slug: course.slug,
        category_name: course.categories?.name || 'Chưa phân loại',
        total_lessons: totalLessons,
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_progress: Math.round(avgProgress * 100) / 100,
        total_watch_time_hours: totalWatchTimeHours,
        avg_lesson_completion_time: 0
      },
      lesson_breakdown: include_lesson_breakdown ? lessonBreakdown : [],
      student_progress: studentProgress,
      engagement_trends: engagementTrends,
      performance_metrics: performanceMetrics
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getCourseDashboardStats:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 