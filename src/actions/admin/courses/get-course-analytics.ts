'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getCourseAnalyticsSchema, type GetCourseAnalyticsInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface CourseAnalytics {
  course_id: string
  course_title: string
  total_enrollments: number
  active_enrollments: number
  completed_enrollments: number
  dropped_enrollments: number
  completion_rate: number
  average_progress: number
  total_lessons: number
  total_watch_time: number
  average_watch_time_per_student: number
  enrollment_trend: Array<{
    date: string
    count: number
  }>
  completion_trend: Array<{
    date: string
    count: number
  }>
  lesson_analytics: Array<{
    lesson_id: string
    lesson_title: string
    completion_rate: number
    average_watch_time: number
    drop_off_rate: number
  }>
}

type Result = 
  | { success: true; data: CourseAnalytics }
  | { success: false; error: string }

export async function getCourseAnalytics(
  params: GetCourseAnalyticsInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getCourseAnalyticsSchema.parse(params)
    const { course_id, period, start_date, end_date } = validatedParams

    // Check admin authentication
    await requireAdmin()

    const supabase = await createClient()

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // Calculate date range based on period
    const now = new Date()
    let periodStart: Date
    
    switch (period) {
      case 'day':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const dateFilter = start_date && end_date 
      ? { start: new Date(start_date), end: new Date(end_date) }
      : { start: periodStart, end: now }

    // Get enrollment statistics
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', course_id)

    if (enrollmentsError) {
      console.error('Error getting enrollments:', enrollmentsError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    const totalEnrollments = enrollments?.length || 0
    const activeEnrollments = enrollments?.filter(e => e.status === 'active').length || 0
    const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0
    const droppedEnrollments = enrollments?.filter(e => e.status === 'dropped').length || 0
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

    // Get lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course_id)
      .eq('is_published', true)
      .order('order_index')

    if (lessonsError) {
      console.error('Error getting lessons:', lessonsError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    const totalLessons = lessons?.length || 0

    // Get lesson progress data
    const { data: lessonProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lessons!inner(id, title, course_id),
        enrollments!inner(course_id)
      `)
      .eq('lessons.course_id', course_id)

    if (progressError) {
      console.error('Error getting lesson progress:', progressError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    // Calculate total watch time and average progress
    const totalWatchTime = lessonProgress?.reduce((sum, progress) => sum + (progress.watched_seconds || 0), 0) || 0
    const averageWatchTimePerStudent = totalEnrollments > 0 ? Math.round(totalWatchTime / totalEnrollments) : 0

    // Calculate average progress
    const studentProgresses = enrollments?.map(enrollment => {
      const studentLessonProgress = lessonProgress?.filter(lp => lp.student_id === enrollment.student_id) || []
      const completedLessons = studentLessonProgress.filter(lp => lp.completed_at).length
      return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
    }) || []

    const averageProgress = studentProgresses.length > 0 
      ? Math.round(studentProgresses.reduce((sum, progress) => sum + progress, 0) / studentProgresses.length)
      : 0

    // Get enrollment trend data
    const enrollmentTrend = await getEnrollmentTrend(supabase, course_id, dateFilter, period)
    
    // Get completion trend data
    const completionTrend = await getCompletionTrend(supabase, course_id, dateFilter, period)

    // Calculate lesson analytics
    const lessonAnalytics = await Promise.all(
      (lessons || []).map(async (lesson) => {
        const lessonProgressData = lessonProgress?.filter(lp => lp.lesson_id === lesson.id) || []
        const completedCount = lessonProgressData.filter(lp => lp.completed_at).length
        const lessonCompletionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0
        const averageWatchTime = lessonProgressData.length > 0 
          ? Math.round(lessonProgressData.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0) / lessonProgressData.length)
          : 0

        // Calculate drop-off rate (students who started but didn't complete)
        const startedCount = lessonProgressData.length
        const dropOffRate = startedCount > 0 ? Math.round(((startedCount - completedCount) / startedCount) * 100) : 0

        return {
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          completion_rate: lessonCompletionRate,
          average_watch_time: averageWatchTime,
          drop_off_rate: dropOffRate,
        }
      })
    )

    const analytics: CourseAnalytics = {
      course_id: course.id,
      course_title: course.title,
      total_enrollments: totalEnrollments,
      active_enrollments: activeEnrollments,
      completed_enrollments: completedEnrollments,
      dropped_enrollments: droppedEnrollments,
      completion_rate: completionRate,
      average_progress: averageProgress,
      total_lessons: totalLessons,
      total_watch_time: totalWatchTime,
      average_watch_time_per_student: averageWatchTimePerStudent,
      enrollment_trend: enrollmentTrend,
      completion_trend: completionTrend,
      lesson_analytics: lessonAnalytics,
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Error in getCourseAnalytics:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

// Helper function to get enrollment trend
async function getEnrollmentTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  dateFilter: { start: Date; end: Date },
  period: string
): Promise<Array<{ date: string; count: number }>> {
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('enrolled_at')
    .eq('course_id', courseId)
    .gte('enrolled_at', dateFilter.start.toISOString())
    .lte('enrolled_at', dateFilter.end.toISOString())

  // Group by date based on period
  const trendData: { [key: string]: number } = {}
  
  enrollments?.forEach((enrollment) => {
    const date = new Date(enrollment.enrolled_at)
    let dateKey: string

    switch (period) {
      case 'day':
        dateKey = date.toISOString().split('T')[0] + 'T' + String(date.getHours()).padStart(2, '0') + ':00:00'
        break
      case 'week':
      case 'month':
        dateKey = date.toISOString().split('T')[0]
        break
      case 'year':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        dateKey = date.toISOString().split('T')[0]
    }

    trendData[dateKey] = (trendData[dateKey] || 0) + 1
  })

  return Object.entries(trendData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Helper function to get completion trend
async function getCompletionTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  dateFilter: { start: Date; end: Date },
  period: string
): Promise<Array<{ date: string; count: number }>> {
  const { data: completions } = await supabase
    .from('enrollments')
    .select('completed_at')
    .eq('course_id', courseId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .gte('completed_at', dateFilter.start.toISOString())
    .lte('completed_at', dateFilter.end.toISOString())

  // Group by date based on period
  const trendData: { [key: string]: number } = {}
  
  completions?.forEach((completion) => {
    if (completion.completed_at) {
      const date = new Date(completion.completed_at)
      let dateKey: string

      switch (period) {
        case 'day':
          dateKey = date.toISOString().split('T')[0] + 'T' + String(date.getHours()).padStart(2, '0') + ':00:00'
          break
        case 'week':
        case 'month':
          dateKey = date.toISOString().split('T')[0]
          break
        case 'year':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          dateKey = date.toISOString().split('T')[0]
      }

      trendData[dateKey] = (trendData[dateKey] || 0) + 1
    }
  })

  return Object.entries(trendData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
} 