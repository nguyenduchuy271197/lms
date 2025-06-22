'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getCourseCompletionSchema, type GetCourseCompletionInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import type { Course, Category } from '@/types/custom.types'

interface CourseCompletionData extends Course {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null
  total_enrollments: number
  active_enrollments: number
  completed_enrollments: number
  dropped_enrollments: number
  completion_rate: number
  average_completion_time_days: number
  recent_completions: number
  completion_trend: Array<{
    date: string
    completions: number
    enrollments: number
    rate: number
  }>
}

interface CompletionRatesResponse {
  courses: CourseCompletionData[]
  summary: {
    total_courses: number
    average_completion_rate: number
    best_performing_course: {
      id: string
      title: string
      completion_rate: number
    } | null
    worst_performing_course: {
      id: string
      title: string
      completion_rate: number
    } | null
  }
}

type Result = 
  | { success: true; data: CompletionRatesResponse }
  | { success: false; error: string }

export async function getCourseCompletion(
  params: GetCourseCompletionInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getCourseCompletionSchema.parse(params)
    const { course_id, category_id, period, min_completion_rate } = validatedParams

    // Check admin authentication
    await requireAdmin()

    const supabase = await createClient()

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

    // Build courses query
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

    // Apply filters
    if (course_id) {
      coursesQuery = coursesQuery.eq('id', course_id)
    }

    if (category_id) {
      coursesQuery = coursesQuery.eq('category_id', category_id)
    }

    const { data: courses, error: coursesError } = await coursesQuery

    if (coursesError) {
      console.error('Error getting courses:', coursesError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    if (!courses || courses.length === 0) {
      return { success: true, data: { courses: [], summary: { total_courses: 0, average_completion_rate: 0, best_performing_course: null, worst_performing_course: null } } }
    }

    // Process each course
    const coursesWithCompletion: (CourseCompletionData | null)[] = await Promise.all(
      courses.map(async (course) => {
        // Get all enrollments for this course
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', course.id)

        if (enrollmentsError) {
          console.error(`Error getting enrollments for course ${course.id}:`, enrollmentsError)
          return null
        }

        const totalEnrollments = enrollments?.length || 0
        const activeEnrollments = enrollments?.filter(e => e.status === 'active').length || 0
        const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0
        const droppedEnrollments = enrollments?.filter(e => e.status === 'dropped').length || 0
        
        const completionRate = totalEnrollments > 0 
          ? Math.round((completedEnrollments / totalEnrollments) * 100)
          : 0

        // Calculate average completion time
        const completedEnrollmentsWithDates = enrollments?.filter(e => 
          e.status === 'completed' && e.enrolled_at && e.completed_at
        ) || []

        const averageCompletionTimeDays = completedEnrollmentsWithDates.length > 0
          ? Math.round(
              completedEnrollmentsWithDates.reduce((sum, enrollment) => {
                const enrolledDate = new Date(enrollment.enrolled_at)
                const completedDate = new Date(enrollment.completed_at!)
                const diffDays = (completedDate.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24)
                return sum + diffDays
              }, 0) / completedEnrollmentsWithDates.length
            )
          : 0

        // Get recent completions (within the period)
        const recentCompletions = enrollments?.filter(e => 
          e.status === 'completed' && 
          e.completed_at &&
          new Date(e.completed_at) >= periodStart &&
          new Date(e.completed_at) <= now
        ).length || 0

        // Get completion trend data
        const completionTrend = await getCompletionTrend(supabase, course.id, periodStart, now, period)

        return {
          ...course,
          total_enrollments: totalEnrollments,
          active_enrollments: activeEnrollments,
          completed_enrollments: completedEnrollments,
          dropped_enrollments: droppedEnrollments,
          completion_rate: completionRate,
          average_completion_time_days: averageCompletionTimeDays,
          recent_completions: recentCompletions,
          completion_trend: completionTrend,
        }
      })
    )

    // Filter out null results and apply minimum completion rate filter
    const validCourses = coursesWithCompletion
      .filter((course): course is CourseCompletionData => course !== null)
      .filter(course => 
        min_completion_rate === undefined || course.completion_rate >= min_completion_rate
      )

    // Calculate summary statistics
    const totalCourses = validCourses.length
    const averageCompletionRate = totalCourses > 0
      ? Math.round(validCourses.reduce((sum, course) => sum + course.completion_rate, 0) / totalCourses)
      : 0

    // Find best and worst performing courses
    const sortedByCompletion = [...validCourses].sort((a, b) => b.completion_rate - a.completion_rate)
    const bestPerforming = sortedByCompletion.length > 0 ? {
      id: sortedByCompletion[0].id,
      title: sortedByCompletion[0].title,
      completion_rate: sortedByCompletion[0].completion_rate
    } : null

    const worstPerforming = sortedByCompletion.length > 0 ? {
      id: sortedByCompletion[sortedByCompletion.length - 1].id,
      title: sortedByCompletion[sortedByCompletion.length - 1].title,
      completion_rate: sortedByCompletion[sortedByCompletion.length - 1].completion_rate
    } : null

    const response: CompletionRatesResponse = {
      courses: validCourses.sort((a, b) => b.completion_rate - a.completion_rate),
      summary: {
        total_courses: totalCourses,
        average_completion_rate: averageCompletionRate,
        best_performing_course: bestPerforming,
        worst_performing_course: worstPerforming,
      }
    }

    return { success: true, data: response }
  } catch (error) {
    console.error('Error in getCourseCompletion:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

// Helper function to get completion trend
async function getCompletionTrend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  startDate: Date,
  endDate: Date,
  period: string
): Promise<Array<{ date: string; completions: number; enrollments: number; rate: number }>> {
  // Generate date range
  const trendData: { [key: string]: { completions: number; enrollments: number } } = {}
  
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    trendData[dateKey] = { completions: 0, enrollments: 0 }
    
    // Increment based on period
    switch (period) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
      default:
        currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  // Get enrollments by date
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('enrolled_at')
    .eq('course_id', courseId)
    .gte('enrolled_at', startDate.toISOString())
    .lte('enrolled_at', endDate.toISOString())

  enrollments?.forEach((enrollment: { enrolled_at: string }) => {
    const date = new Date(enrollment.enrolled_at).toISOString().split('T')[0]
    if (trendData[date]) {
      trendData[date].enrollments++
    }
  })

  // Get completions by date
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
      if (trendData[date]) {
        trendData[date].completions++
      }
    }
  })

  // Calculate rates and return sorted data
  return Object.entries(trendData)
    .map(([date, data]) => ({
      date,
      completions: data.completions,
      enrollments: data.enrollments,
      rate: data.enrollments > 0 ? Math.round((data.completions / data.enrollments) * 100) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
} 