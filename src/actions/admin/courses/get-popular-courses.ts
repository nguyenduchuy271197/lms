'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getPopularCoursesSchema, type GetPopularCoursesInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import type { Course, Category } from '@/types/custom.types'

interface PopularCourse extends Course {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null
  metric_value: number
  enrollments_count: number
  completions_count: number
  total_watch_time: number
  completion_rate: number
  rank: number
}

type Result = 
  | { success: true; data: PopularCourse[] }
  | { success: false; error: string }

export async function getPopularCourses(
  params: GetPopularCoursesInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getPopularCoursesSchema.parse(params)
    const { limit, period, metric, category_id } = validatedParams

    // Check admin authentication
    await requireAdmin()

    const supabase = await createClient()

    // Calculate date range based on period (except for all_time)
    let dateFilter: { start?: Date; end?: Date } = {}
    if (period !== 'all_time') {
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
      
      dateFilter = { start: periodStart, end: now }
    }

    // Get courses with basic info
    let coursesQuery = supabase
      .from('courses')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_published', true)

    // Apply category filter if specified
    if (category_id) {
      coursesQuery = coursesQuery.eq('category_id', category_id)
    }

    const { data: courses, error: coursesError } = await coursesQuery

    if (coursesError) {
      console.error('Error getting courses:', coursesError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    if (!courses || courses.length === 0) {
      return { success: true, data: [] }
    }

    // Calculate metrics for each course
    const coursesWithMetrics: PopularCourse[] = await Promise.all(
      courses.map(async (course) => {
        let metricValue = 0

        // Get enrollments data
        let enrollmentsQuery = supabase
          .from('enrollments')
          .select('*', { count: 'exact' })
          .eq('course_id', course.id)

        if (dateFilter.start && metric === 'enrollments') {
          enrollmentsQuery = enrollmentsQuery
            .gte('enrolled_at', dateFilter.start.toISOString())
            .lte('enrolled_at', dateFilter.end!.toISOString())
        }

        const { count: enrollmentsCount } = await enrollmentsQuery

        // Get completions data
        let completionsQuery = supabase
          .from('enrollments')
          .select('*', { count: 'exact' })
          .eq('course_id', course.id)
          .eq('status', 'completed')

        if (dateFilter.start && metric === 'completions') {
          completionsQuery = completionsQuery
            .not('completed_at', 'is', null)
            .gte('completed_at', dateFilter.start.toISOString())
            .lte('completed_at', dateFilter.end!.toISOString())
        }

        const { count: completionsCount } = await completionsQuery

        // Get watch time data
        let watchTimeQuery = supabase
          .from('lesson_progress')
          .select(`
            watched_seconds,
            lessons!inner(course_id)
          `)
          .eq('lessons.course_id', course.id)

        if (dateFilter.start && metric === 'watch_time') {
          watchTimeQuery = watchTimeQuery
            .gte('last_watched_at', dateFilter.start.toISOString())
            .lte('last_watched_at', dateFilter.end!.toISOString())
        }

        const { data: watchTimeData } = await watchTimeQuery
        const totalWatchTime = watchTimeData?.reduce((sum, progress) => 
          sum + (progress.watched_seconds || 0), 0) || 0

        // Calculate completion rate
        const completionRate = enrollmentsCount && enrollmentsCount > 0 
          ? Math.round(((completionsCount || 0) / enrollmentsCount) * 100)
          : 0

        // Set metric value based on selected metric
        switch (metric) {
          case 'enrollments':
            metricValue = enrollmentsCount || 0
            break
          case 'completions':
            metricValue = completionsCount || 0
            break
          case 'watch_time':
            metricValue = totalWatchTime
            break
          case 'rating':
            // For now, use completion rate as a proxy for rating
            // In a real app, you'd have a separate ratings table
            metricValue = completionRate
            break
          default:
            metricValue = enrollmentsCount || 0
        }

        return {
          ...course,
          metric_value: metricValue,
          enrollments_count: enrollmentsCount || 0,
          completions_count: completionsCount || 0,
          total_watch_time: totalWatchTime,
          completion_rate: completionRate,
          rank: 0, // Will be set after sorting
        }
      })
    )

    // Sort by metric value (descending) and assign ranks
    const sortedCourses = coursesWithMetrics
      .sort((a, b) => b.metric_value - a.metric_value)
      .slice(0, limit)
      .map((course, index) => ({
        ...course,
        rank: index + 1,
      }))

    return { success: true, data: sortedCourses }
  } catch (error) {
    console.error('Error in getPopularCourses:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 