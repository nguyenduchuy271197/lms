'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminDashboardStatsSchema, type GetAdminDashboardStatsInput } from '@/lib/validations/dashboard-analytics'
import { GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAdmin } from '@/lib/auth'

export interface AdminDashboardStats {
  overview: {
    total_students: number
    total_courses: number
    total_lessons: number
    total_enrollments: number
    active_enrollments: number
    completed_enrollments: number
    total_watch_time_hours: number
    avg_completion_rate: number
  }
  trends: {
    new_students_this_period: number
    new_enrollments_this_period: number
    completed_courses_this_period: number
    growth_rate_students: number
    growth_rate_enrollments: number
  }
  top_courses: Array<{
    id: string
    title: string
    slug: string
    enrollment_count: number
    completion_rate: number
    avg_progress: number
    category_name: string
  }>
  category_performance: Array<{
    category_id: string
    category_name: string
    total_courses: number
    total_enrollments: number
    avg_completion_rate: number
    total_watch_time_hours: number
  }>
  student_activity: Array<{
    date: string
    new_students: number
    new_enrollments: number
    lessons_completed: number
    courses_completed: number
  }>
  engagement_metrics: {
    daily_active_students: number
    weekly_active_students: number
    monthly_active_students: number
    avg_session_duration_minutes: number
    bounce_rate: number
  }
}

type Result = 
  | { success: true; data: AdminDashboardStats }
  | { success: false; error: string }

export async function getAdminDashboardStats(
  params: GetAdminDashboardStatsInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = getAdminDashboardStatsSchema.parse(params)
    const { period } = validatedData

    // Authentication & authorization check
    await requireAdmin()

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
    const [
      studentsResult,
      coursesResult,
      lessonsResult,
      enrollmentsResult,
      progressResult
    ] = await Promise.all([
      // Total students
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'student'),
      
      // Total courses
      supabase
        .from('courses')
        .select('id', { count: 'exact' })
        .eq('is_published', true),
      
      // Total lessons
      supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('is_published', true),
      
      // Enrollments
      supabase
        .from('enrollments')
        .select('id, status, enrolled_at')
        .gte('enrolled_at', startDate?.toISOString() || '1970-01-01'),
      
      // Lesson progress for watch time
      supabase
        .from('lesson_progress')
        .select('watched_seconds')
        .gte('last_watched_at', startDate?.toISOString() || '1970-01-01')
    ])

    if (studentsResult.error || coursesResult.error || lessonsResult.error || 
        enrollmentsResult.error || progressResult.error) {
      console.error('Error fetching overview stats')
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    const totalStudents = studentsResult.count || 0
    const totalCourses = coursesResult.count || 0
    const totalLessons = lessonsResult.count || 0
    const enrollments = enrollmentsResult.data || []
    const totalEnrollments = enrollments.length
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
    const totalWatchTimeSeconds = progressResult.data?.reduce((sum, p) => sum + (p.watched_seconds || 0), 0) || 0
    const totalWatchTimeHours = Math.round(totalWatchTimeSeconds / 3600 * 100) / 100

    // Calculate completion rate
    const avgCompletionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

    // Get top courses with enrollment and completion data
    const { data: topCoursesData, error: topCoursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        categories (
          id,
          name
        ),
        enrollments (
          id,
          status
        )
      `)
      .eq('is_published', true)
      .limit(10)

    if (topCoursesError) {
      console.error('Error fetching top courses:', topCoursesError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    const topCourses = (topCoursesData || []).map(course => {
      const enrollmentCount = course.enrollments?.length || 0
      const completedCount = course.enrollments?.filter(e => e.status === 'completed').length || 0
      const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0
      
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        enrollment_count: enrollmentCount,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_progress: 0, // Would need more complex calculation
        category_name: course.categories?.name || 'Chưa phân loại'
      }
    }).sort((a, b) => b.enrollment_count - a.enrollment_count)

    // Get category performance
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        courses (
          id,
          enrollments (
            id,
            status
          )
        )
      `)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    const categoryPerformance = (categoriesData || []).map(category => {
      const totalCourses = category.courses?.length || 0
      const allEnrollments = category.courses?.flatMap(c => c.enrollments || []) || []
      const totalEnrollments = allEnrollments.length
      const completedEnrollments = allEnrollments.filter(e => e.status === 'completed').length
      const avgCompletionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0
      
      return {
        category_id: category.id,
        category_name: category.name,
        total_courses: totalCourses,
        total_enrollments: totalEnrollments,
        avg_completion_rate: Math.round(avgCompletionRate * 100) / 100,
        total_watch_time_hours: 0 // Would need lesson progress data joined
      }
    })

    // Calculate trends (simplified)
    
    const [newStudentsResult, newEnrollmentsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'student')
        .gte('created_at', startDate?.toISOString() || '1970-01-01'),
      
      supabase
        .from('enrollments')
        .select('id', { count: 'exact' })
        .gte('enrolled_at', startDate?.toISOString() || '1970-01-01')
    ])

    const newStudentsThisPeriod = newStudentsResult.count || 0
    const newEnrollmentsThisPeriod = newEnrollmentsResult.count || 0

    // Build result
    const result: AdminDashboardStats = {
      overview: {
        total_students: totalStudents,
        total_courses: totalCourses,
        total_lessons: totalLessons,
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        total_watch_time_hours: totalWatchTimeHours,
        avg_completion_rate: Math.round(avgCompletionRate * 100) / 100
      },
      trends: {
        new_students_this_period: newStudentsThisPeriod,
        new_enrollments_this_period: newEnrollmentsThisPeriod,
        completed_courses_this_period: completedEnrollments,
        growth_rate_students: 0, // Would need previous period data
        growth_rate_enrollments: 0 // Would need previous period data
      },
      top_courses: topCourses,
      category_performance: categoryPerformance,
      student_activity: [], // Would need daily aggregation
      engagement_metrics: {
        daily_active_students: 0, // Would need session tracking
        weekly_active_students: 0,
        monthly_active_students: 0,
        avg_session_duration_minutes: 0,
        bounce_rate: 0
      }
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getAdminDashboardStats:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 