'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getCourseEngagementSchema, type GetCourseEngagementInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface EngagementMetrics {
  course_id: string
  course_title: string
  period: string
  views: number
  enrollments: number
  completions: number
  watch_time: number
  drop_rate: number
  engagement_score: number
  daily_metrics: Array<{
    date: string
    views: number
    enrollments: number
    completions: number
    watch_time: number
  }>
  lesson_engagement: Array<{
    lesson_id: string
    lesson_title: string
    views: number
    completion_rate: number
    average_watch_time: number
    drop_off_rate: number
  }>
}

type Result = 
  | { success: true; data: EngagementMetrics }
  | { success: false; error: string }

export async function getCourseEngagement(
  params: GetCourseEngagementInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getCourseEngagementSchema.parse(params)
    const { course_id, period, metrics } = validatedParams

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
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Initialize metrics
    let views = 0
    let enrollments = 0
    let completions = 0
    let watchTime = 0
    let dropRate = 0

    // Get enrollments data
    if (metrics.includes('enrollments')) {
      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course_id)
        .gte('enrolled_at', periodStart.toISOString())
        .lte('enrolled_at', now.toISOString())

      enrollments = enrollmentsCount || 0
    }

    // Get completions data
    if (metrics.includes('completions')) {
      const { count: completionsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course_id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', periodStart.toISOString())
        .lte('completed_at', now.toISOString())

      completions = completionsCount || 0
    }

    // Get watch time data
    if (metrics.includes('watch_time')) {
      const { data: lessonProgress } = await supabase
        .from('lesson_progress')
        .select(`
          watched_seconds,
          last_watched_at,
          lessons!inner(course_id)
        `)
        .eq('lessons.course_id', course_id)
        .gte('last_watched_at', periodStart.toISOString())
        .lte('last_watched_at', now.toISOString())

      watchTime = lessonProgress?.reduce((sum, progress) => 
        sum + (progress.watched_seconds || 0), 0) || 0
    }

    // Calculate drop rate
    if (metrics.includes('drop_rate')) {
      const { count: totalEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course_id)

      const { count: droppedEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course_id)
        .eq('status', 'dropped')

      dropRate = totalEnrollments && totalEnrollments > 0 
        ? Math.round(((droppedEnrollments || 0) / totalEnrollments) * 100)
        : 0
    }

    // Calculate views (approximated by lesson progress entries)
    if (metrics.includes('views')) {
      const { count: viewsCount } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons!inner(course_id)
        `, { count: 'exact', head: true })
        .eq('lessons.course_id', course_id)
        .gte('last_watched_at', periodStart.toISOString())
        .lte('last_watched_at', now.toISOString())

      views = viewsCount || 0
    }

    // Get daily metrics
    const dailyMetrics = await getDailyMetrics(supabase, course_id, periodStart, now)

    // Get lesson engagement
    const lessonEngagement = await getLessonEngagement(supabase, course_id, periodStart, now)

    // Calculate engagement score (0-100)
    const engagementScore = calculateEngagementScore({
      enrollments,
      completions,
      watchTime,
      dropRate,
      views
    })

    const result: EngagementMetrics = {
      course_id: course.id,
      course_title: course.title,
      period,
      views,
      enrollments,
      completions,
      watch_time: watchTime,
      drop_rate: dropRate,
      engagement_score: engagementScore,
      daily_metrics: dailyMetrics,
      lesson_engagement: lessonEngagement,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Error in getCourseEngagement:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

// Helper function to get daily metrics
async function getDailyMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; views: number; enrollments: number; completions: number; watch_time: number }>> {
  const dailyData: { [key: string]: { views: number; enrollments: number; completions: number; watch_time: number } } = {}

  // Generate date range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyData[dateKey] = { views: 0, enrollments: 0, completions: 0, watch_time: 0 }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Get enrollments by day
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('enrolled_at')
    .eq('course_id', courseId)
    .gte('enrolled_at', startDate.toISOString())
    .lte('enrolled_at', endDate.toISOString())

  enrollments?.forEach((enrollment: { enrolled_at: string }) => {
    const date = new Date(enrollment.enrolled_at).toISOString().split('T')[0]
    if (dailyData[date]) {
      dailyData[date].enrollments++
    }
  })

  // Get completions by day
  const { data: completions } = await supabase
    .from('enrollments')
    .select('completed_at')
    .eq('course_id', courseId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString())

  completions?.forEach((completion: { completed_at: string | null }) => {
    if (completion.completed_at) {
      const date = new Date(completion.completed_at).toISOString().split('T')[0]
      if (dailyData[date]) {
        dailyData[date].completions++
      }
    }
  })

  // Get watch time and views by day
  const { data: lessonProgress } = await supabase
    .from('lesson_progress')
    .select(`
      watched_seconds,
      last_watched_at,
      lessons!inner(course_id)
    `)
    .eq('lessons.course_id', courseId)
    .gte('last_watched_at', startDate.toISOString())
    .lte('last_watched_at', endDate.toISOString())

  lessonProgress?.forEach((progress: { watched_seconds: number | null; last_watched_at: string }) => {
    const date = new Date(progress.last_watched_at).toISOString().split('T')[0]
    if (dailyData[date]) {
      dailyData[date].views++
      dailyData[date].watch_time += progress.watched_seconds || 0
    }
  })

  return Object.entries(dailyData)
    .map(([date, metrics]) => ({
      date,
      ...metrics
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Helper function to get lesson engagement
async function getLessonEngagement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{
  lesson_id: string;
  lesson_title: string;
  views: number;
  completion_rate: number;
  average_watch_time: number;
  drop_off_rate: number;
}>> {
  // Get lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, duration_seconds')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .order('order_index')

  if (!lessons) return []

  const lessonEngagement = await Promise.all(
    lessons.map(async (lesson) => {
      // Get lesson progress data
      const { data: lessonProgress } = await supabase
        .from('lesson_progress')
        .select('watched_seconds, completed_at, last_watched_at')
        .eq('lesson_id', lesson.id)
        .gte('last_watched_at', startDate.toISOString())
        .lte('last_watched_at', endDate.toISOString())

      const views = lessonProgress?.length || 0
      const completions = lessonProgress?.filter(lp => lp.completed_at).length || 0
      const completionRate = views > 0 ? Math.round((completions / views) * 100) : 0
      
      const totalWatchTime = lessonProgress?.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0) || 0
      const averageWatchTime = views > 0 ? Math.round(totalWatchTime / views) : 0
      
      const dropOffRate = views > 0 ? Math.round(((views - completions) / views) * 100) : 0

      return {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        views,
        completion_rate: completionRate,
        average_watch_time: averageWatchTime,
        drop_off_rate: dropOffRate,
      }
    })
  )

  return lessonEngagement
}

// Helper function to calculate engagement score
function calculateEngagementScore(metrics: {
  enrollments: number;
  completions: number;
  watchTime: number;
  dropRate: number;
  views: number;
}): number {
  const { enrollments, completions, watchTime, dropRate, views } = metrics

  // Base score from completion rate
  const completionRate = enrollments > 0 ? (completions / enrollments) * 100 : 0
  let score = completionRate * 0.4 // 40% weight

  // Add points for watch time (normalized)
  const watchTimeScore = Math.min((watchTime / 3600), 10) * 10 // Max 10 points for 1 hour+
  score += watchTimeScore * 0.3 // 30% weight

  // Add points for views
  const viewsScore = Math.min(views / 100, 10) * 10 // Max 10 points for 100+ views
  score += viewsScore * 0.2 // 20% weight

  // Subtract points for drop rate
  const dropRateScore = Math.max(0, 100 - dropRate)
  score += dropRateScore * 0.1 // 10% weight

  return Math.round(Math.min(score, 100))
} 