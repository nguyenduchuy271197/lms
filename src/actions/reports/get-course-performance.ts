'use server'

import { createClient } from '@/lib/supabase/server'
import { getCoursePerformanceSchema, type GetCoursePerformanceInput } from '@/lib/validations/dashboard-analytics'
import { GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAdmin } from '@/lib/auth'

export interface CoursePerformanceData {
  summary: {
    total_courses: number
    avg_completion_rate: number
    avg_enrollment_count: number
    top_performing_course: string
    lowest_performing_course: string
    total_watch_time_hours: number
  }
  course_metrics: Array<{
    course_id: string
    course_title: string
    course_slug: string
    category_name: string
    enrollment_count: number
    completion_rate: number
    avg_progress: number
    avg_watch_time_hours: number
    engagement_score: number
    student_satisfaction: number
    difficulty_rating: number
    time_to_completion_days: number
  }>
  performance_trends: Array<{
    date: string
    avg_completion_rate: number
    total_enrollments: number
    total_completions: number
    avg_engagement_score: number
  }>
  category_comparison: Array<{
    category_id: string
    category_name: string
    course_count: number
    avg_completion_rate: number
    avg_enrollment_count: number
    total_watch_time_hours: number
    engagement_score: number
  }>
  detailed_analysis: {
    top_performers: Array<{
      course_id: string
      course_title: string
      metric: string
      value: number
      rank: number
    }>
    improvement_opportunities: Array<{
      course_id: string
      course_title: string
      issue: string
      recommendation: string
      priority: 'high' | 'medium' | 'low'
    }>
    benchmark_comparison: {
      industry_avg_completion_rate: number
      platform_avg_completion_rate: number
      performance_vs_industry: number
      performance_vs_platform: number
    }
  }
}

type Result = 
  | { success: true; data: CoursePerformanceData }
  | { success: false; error: string }

export async function getCoursePerformance(
  params: GetCoursePerformanceInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = getCoursePerformanceSchema.parse(params)
    const { period, category_id, course_ids, sort_by, sort_order, limit } = validatedData

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

    // Build courses query
    let coursesQuery = supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        is_published,
        categories (
          id,
          name
        ),
        enrollments (
          id,
          status,
          enrolled_at,
          completed_at
        )
      `)
      .eq('is_published', true)

    if (category_id) {
      coursesQuery = coursesQuery.eq('category_id', category_id)
    }

    if (course_ids && course_ids.length > 0) {
      coursesQuery = coursesQuery.in('id', course_ids)
    }

    const { data: courses, error: coursesError } = await coursesQuery

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Get lesson progress data for watch time calculation
    const courseIds = courses?.map(c => c.id) || []
    const { data: lessonProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        watched_seconds,
        last_watched_at,
        lessons (
          course_id
        )
      `)
      .in('lessons.course_id', courseIds)
      .gte('last_watched_at', startDate?.toISOString() || '1970-01-01')

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Calculate course metrics
    const courseMetrics = (courses || []).map(course => {
      // Filter enrollments by date range
      const enrollments = course.enrollments?.filter(e => 
        !startDate || new Date(e.enrolled_at) >= startDate
      ) || []

      const enrollmentCount = enrollments.length
      const completedCount = enrollments.filter(e => e.status === 'completed').length
      const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0

      // Calculate watch time for this course
      const courseLessonProgress = lessonProgress?.filter(lp => lp.lessons?.course_id === course.id) || []
      const totalWatchTimeSeconds = courseLessonProgress.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0)
      const avgWatchTimeHours = enrollmentCount > 0 
        ? (totalWatchTimeSeconds / 3600) / enrollmentCount 
        : 0

      // Calculate time to completion
      const completedWithDates = enrollments.filter(e => e.status === 'completed' && e.completed_at)
      const avgTimeToCompletion = completedWithDates.length > 0 
        ? completedWithDates.reduce((sum, e) => {
            const enrollDate = new Date(e.enrolled_at)
            const completeDate = new Date(e.completed_at!)
            const daysDiff = (completeDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24)
            return sum + daysDiff
          }, 0) / completedWithDates.length
        : 0

      // Calculate engagement score (simplified)
      const engagementScore = Math.min(100, (completionRate * 0.6) + (avgWatchTimeHours * 10) + 
        (enrollmentCount > 0 ? Math.min(40, enrollmentCount) : 0))

      return {
        course_id: course.id,
        course_title: course.title,
        course_slug: course.slug,
        category_name: course.categories?.name || 'Chưa phân loại',
        enrollment_count: enrollmentCount,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_progress: 0, // Would need detailed progress calculation
        avg_watch_time_hours: Math.round(avgWatchTimeHours * 100) / 100,
        engagement_score: Math.round(engagementScore * 100) / 100,
        student_satisfaction: 0, // Would need rating system
        difficulty_rating: 0, // Would need difficulty assessment
        time_to_completion_days: Math.round(avgTimeToCompletion * 100) / 100
      }
    })

    // Sort course metrics
    courseMetrics.sort((a, b) => {
      const aValue = a[sort_by as keyof typeof a] as number
      const bValue = b[sort_by as keyof typeof b] as number
      
      if (sort_order === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    // Limit results
    const limitedCourseMetrics = courseMetrics.slice(0, limit)

    // Calculate summary stats
    const totalCourses = courseMetrics.length
    const avgCompletionRate = totalCourses > 0 
      ? courseMetrics.reduce((sum, c) => sum + c.completion_rate, 0) / totalCourses 
      : 0
    const avgEnrollmentCount = totalCourses > 0 
      ? courseMetrics.reduce((sum, c) => sum + c.enrollment_count, 0) / totalCourses 
      : 0
    const totalWatchTimeHours = courseMetrics.reduce((sum, c) => sum + (c.avg_watch_time_hours * c.enrollment_count), 0)
    
    const topPerformingCourse = courseMetrics.length > 0 
      ? courseMetrics.reduce((max, current) => 
          current.completion_rate > max.completion_rate ? current : max
        ).course_title
      : ''
    
    const lowestPerformingCourse = courseMetrics.length > 0 
      ? courseMetrics.reduce((min, current) => 
          current.completion_rate < min.completion_rate ? current : min
        ).course_title
      : ''

    // Build category comparison
    const categoryMap = new Map<string, typeof courseMetrics>()
    
    courseMetrics.forEach(course => {
      const categoryName = course.category_name
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, [])
      }
      categoryMap.get(categoryName)!.push(course)
    })

    const categoryComparison = Array.from(categoryMap.entries()).map(([categoryName, categoryCourses]) => {
      const courseCount = categoryCourses.length
      const avgCompletionRate = courseCount > 0 
        ? categoryCourses.reduce((sum, c) => sum + c.completion_rate, 0) / courseCount 
        : 0
      const avgEnrollmentCount = courseCount > 0 
        ? categoryCourses.reduce((sum, c) => sum + c.enrollment_count, 0) / courseCount 
        : 0
      const totalWatchTime = categoryCourses.reduce((sum, c) => sum + (c.avg_watch_time_hours * c.enrollment_count), 0)
      const avgEngagementScore = courseCount > 0 
        ? categoryCourses.reduce((sum, c) => sum + c.engagement_score, 0) / courseCount 
        : 0

      return {
        category_id: categoryCourses[0]?.course_id || '', // Simplified
        category_name: categoryName,
        course_count: courseCount,
        avg_completion_rate: Math.round(avgCompletionRate * 100) / 100,
        avg_enrollment_count: Math.round(avgEnrollmentCount),
        total_watch_time_hours: Math.round(totalWatchTime * 100) / 100,
        engagement_score: Math.round(avgEngagementScore * 100) / 100
      }
    })

    // Build top performers
    const topPerformers = [
      ...courseMetrics.slice(0, 5).map((course, index) => ({
        course_id: course.course_id,
        course_title: course.course_title,
        metric: 'Tỷ lệ hoàn thành',
        value: course.completion_rate,
        rank: index + 1
      }))
    ]

    // Build improvement opportunities (simplified)
    const improvementOpportunities = courseMetrics
      .filter(c => c.completion_rate < 50 || c.enrollment_count < 10)
      .slice(0, 5)
      .map(course => ({
        course_id: course.course_id,
        course_title: course.course_title,
        issue: course.completion_rate < 50 ? 'Tỷ lệ hoàn thành thấp' : 'Ít học viên đăng ký',
        recommendation: course.completion_rate < 50 
          ? 'Cải thiện nội dung và cấu trúc khóa học' 
          : 'Tăng cường marketing và quảng bá',
        priority: course.completion_rate < 30 ? 'high' as const : 'medium' as const
      }))

    const result: CoursePerformanceData = {
      summary: {
        total_courses: totalCourses,
        avg_completion_rate: Math.round(avgCompletionRate * 100) / 100,
        avg_enrollment_count: Math.round(avgEnrollmentCount),
        top_performing_course: topPerformingCourse,
        lowest_performing_course: lowestPerformingCourse,
        total_watch_time_hours: Math.round(totalWatchTimeHours * 100) / 100
      },
      course_metrics: limitedCourseMetrics,
      performance_trends: [], // Would need time-series data
      category_comparison: categoryComparison,
      detailed_analysis: {
        top_performers: topPerformers,
        improvement_opportunities: improvementOpportunities,
        benchmark_comparison: {
          industry_avg_completion_rate: 65, // Industry benchmark
          platform_avg_completion_rate: avgCompletionRate,
          performance_vs_industry: avgCompletionRate - 65,
          performance_vs_platform: 0 // Same as platform average
        }
      }
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getCoursePerformance:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 