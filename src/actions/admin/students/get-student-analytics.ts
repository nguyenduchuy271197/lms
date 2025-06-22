'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getStudentAnalyticsSchema, type GetStudentAnalyticsInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface DailyActivity {
  date: string
  watch_time: number
  lessons_completed: number
  courses_accessed: number
}

interface CoursePerformance {
  course_id: string
  course_title: string
  category_name: string | null
  progress_percentage: number
  time_spent: number
  lessons_completed: number
  total_lessons: number
  last_activity: string | null
  performance_score: number
}

interface StudentAnalyticsResult {
  student_id: string
  student_name: string | null
  period: string
  date_range: {
    from: string
    to: string
  }
  metrics: {
    enrollments: {
      total: number
      active: number
      completed: number
      dropped: number
      completion_rate: number
    }
    completions: {
      total_completed: number
      avg_completion_time: number
      fastest_completion: number | null
      slowest_completion: number | null
    }
    watch_time: {
      total_seconds: number
      daily_average: number
      peak_day: string | null
      peak_day_time: number
    }
    progress_rate: {
      average_progress: number
      courses_above_50: number
      courses_above_80: number
      stalled_courses: number
    }
    engagement_score: {
      score: number
      factors: {
        consistency: number
        completion_rate: number
        time_investment: number
        course_variety: number
      }
    }
    learning_streak: {
      current_streak: number
      longest_streak: number
      active_days: number
      total_days_in_period: number
    }
    course_performance: CoursePerformance[]
  }
  daily_activity: DailyActivity[]
  trends: {
    enrollment_trend: 'increasing' | 'decreasing' | 'stable'
    engagement_trend: 'improving' | 'declining' | 'stable'
    performance_trend: 'improving' | 'declining' | 'stable'
  }
}

type Result = 
  | { success: true; data: StudentAnalyticsResult }
  | { success: false; error: string }

export async function getStudentAnalytics(params: GetStudentAnalyticsInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getStudentAnalyticsSchema.parse(params)
    const { student_id, period, date_from, date_to, metrics } = validatedParams

    // Check admin permissions
    await requireAdmin()

    const supabase = await createClient()

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: 'Không tìm thấy học viên' }
    }

    // Calculate date range
    let fromDate: Date
    let toDate = new Date()

    if (date_from && date_to) {
      fromDate = new Date(date_from)
      toDate = new Date(date_to)
    } else {
      switch (period) {
        case '7d':
          fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          break
        case '1y':
          fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          break
        case 'all':
        default:
          fromDate = new Date('2020-01-01')
          break
      }
    }

    const result: StudentAnalyticsResult = {
      student_id,
      student_name: student.full_name,
      period,
      date_range: {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      },
      metrics: {
        enrollments: { total: 0, active: 0, completed: 0, dropped: 0, completion_rate: 0 },
        completions: { total_completed: 0, avg_completion_time: 0, fastest_completion: null, slowest_completion: null },
        watch_time: { total_seconds: 0, daily_average: 0, peak_day: null, peak_day_time: 0 },
        progress_rate: { average_progress: 0, courses_above_50: 0, courses_above_80: 0, stalled_courses: 0 },
        engagement_score: { score: 0, factors: { consistency: 0, completion_rate: 0, time_investment: 0, course_variety: 0 } },
        learning_streak: { current_streak: 0, longest_streak: 0, active_days: 0, total_days_in_period: 0 },
        course_performance: []
      },
      daily_activity: [],
      trends: { enrollment_trend: 'stable', engagement_trend: 'stable', performance_trend: 'stable' }
    }

    // Get enrollments data
    if (metrics.includes('enrollments')) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', student_id)
        .gte('enrolled_at', fromDate.toISOString())
        .lte('enrolled_at', toDate.toISOString())

      if (enrollments) {
        const total = enrollments.length
        const active = enrollments.filter(e => e.status === 'active').length
        const completed = enrollments.filter(e => e.status === 'completed').length
        const dropped = enrollments.filter(e => e.status === 'dropped').length
        const completionRate = total > 0 ? (completed / total) * 100 : 0

        result.metrics.enrollments = {
          total,
          active,
          completed,
          dropped,
          completion_rate: Math.round(completionRate * 100) / 100
        }
      }
    }

    // Get completions data
    if (metrics.includes('completions')) {
      const { data: completedEnrollments } = await supabase
        .from('enrollments')
        .select('enrolled_at, completed_at')
        .eq('student_id', student_id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', fromDate.toISOString())
        .lte('completed_at', toDate.toISOString())

      if (completedEnrollments) {
        const completionTimes = completedEnrollments
          .map(e => {
            const enrolled = new Date(e.enrolled_at).getTime()
            const completed = new Date(e.completed_at!).getTime()
            return Math.floor((completed - enrolled) / (1000 * 60 * 60 * 24)) // days
          })
          .filter(days => days > 0)

        const totalCompleted = completedEnrollments.length
        const avgCompletionTime = completionTimes.length > 0 
          ? completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length
          : 0
        const fastestCompletion = completionTimes.length > 0 ? Math.min(...completionTimes) : null
        const slowestCompletion = completionTimes.length > 0 ? Math.max(...completionTimes) : null

        result.metrics.completions = {
          total_completed: totalCompleted,
          avg_completion_time: Math.round(avgCompletionTime * 100) / 100,
          fastest_completion: fastestCompletion,
          slowest_completion: slowestCompletion
        }
      }
    }

    // Get watch time data
    if (metrics.includes('watch_time')) {
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('watched_seconds, last_watched_at')
        .eq('student_id', student_id)
        .gte('last_watched_at', fromDate.toISOString())
        .lte('last_watched_at', toDate.toISOString())

      if (progressData) {
        const totalSeconds = progressData.reduce((sum, p) => sum + (p.watched_seconds || 0), 0)
        const daysInPeriod = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
        const dailyAverage = daysInPeriod > 0 ? totalSeconds / daysInPeriod : 0

        // Calculate daily watch time to find peak day
        const dailyWatchTime: Record<string, number> = {}
        progressData.forEach(p => {
          const day = new Date(p.last_watched_at).toISOString().split('T')[0]
          dailyWatchTime[day] = (dailyWatchTime[day] || 0) + (p.watched_seconds || 0)
        })

        let peakDay: string | null = null
        let peakDayTime = 0
        Object.entries(dailyWatchTime).forEach(([day, time]) => {
          if (time > peakDayTime) {
            peakDay = day
            peakDayTime = time
          }
        })

        result.metrics.watch_time = {
          total_seconds: totalSeconds,
          daily_average: Math.round(dailyAverage),
          peak_day: peakDay,
          peak_day_time: peakDayTime
        }

        // Build daily activity data
        const dailyActivity: DailyActivity[] = []
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          const dayStr = d.toISOString().split('T')[0]
          const dayWatchTime = dailyWatchTime[dayStr] || 0
          
          // Get lessons completed on this day
          const { data: dayLessons } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('student_id', student_id)
            .gte('completed_at', `${dayStr}T00:00:00.000Z`)
            .lte('completed_at', `${dayStr}T23:59:59.999Z`)
            .not('completed_at', 'is', null)

          // Get courses accessed on this day
          const { data: dayCourses } = await supabase
            .from('lesson_progress')
            .select(`
              lessons!inner(course_id)
            `)
            .eq('student_id', student_id)
            .gte('last_watched_at', `${dayStr}T00:00:00.000Z`)
            .lte('last_watched_at', `${dayStr}T23:59:59.999Z`)

          const uniqueCourses = new Set(dayCourses?.map(dc => dc.lessons.course_id) || [])

          dailyActivity.push({
            date: dayStr,
            watch_time: dayWatchTime,
            lessons_completed: dayLessons?.length || 0,
            courses_accessed: uniqueCourses.size
          })
        }

        result.daily_activity = dailyActivity
      }
    }

    // Get progress rate data
    if (metrics.includes('progress_rate')) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', student_id)

      if (enrollments) {
        const progressPromises = enrollments.map(async (enrollment) => {
          const { data: progress } = await supabase
            .rpc('calculate_course_progress', {
              p_student_id: student_id,
              p_course_id: enrollment.course_id
            })
          return progress || 0
        })

        const progressValues = await Promise.all(progressPromises)
        const averageProgress = progressValues.length > 0 
          ? progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length
          : 0

        const coursesAbove50 = progressValues.filter(p => p >= 50).length
        const coursesAbove80 = progressValues.filter(p => p >= 80).length
        const stalledCourses = progressValues.filter(p => p > 0 && p < 10).length

        result.metrics.progress_rate = {
          average_progress: Math.round(averageProgress * 100) / 100,
          courses_above_50: coursesAbove50,
          courses_above_80: coursesAbove80,
          stalled_courses: stalledCourses
        }
      }
    }

    // Calculate engagement score
    if (metrics.includes('engagement_score')) {
      const consistency = result.daily_activity.filter(d => d.watch_time > 0).length / result.daily_activity.length * 100
      const completionRate = result.metrics.enrollments.completion_rate
      const timeInvestment = Math.min(100, result.metrics.watch_time.total_seconds / (60 * 60) * 10) // 10 points per hour, max 100
      
      const { data: categoriesUsed } = await supabase
        .from('lesson_progress')
        .select(`
          lessons!inner(
            courses!inner(
              categories!inner(id)
            )
          )
        `)
        .eq('student_id', student_id)
        .gte('last_watched_at', fromDate.toISOString())
        .lte('last_watched_at', toDate.toISOString())

      const uniqueCategories = new Set(
        categoriesUsed?.map(cu => cu.lessons.courses.categories?.id).filter(id => id) || []
      )
      const courseVariety = Math.min(100, uniqueCategories.size * 20) // 20 points per category, max 100

      const factors = {
        consistency: Math.round(consistency * 100) / 100,
        completion_rate: completionRate,
        time_investment: Math.round(timeInvestment * 100) / 100,
        course_variety: courseVariety
      }

      const score = (consistency + completionRate + timeInvestment + courseVariety) / 4

      result.metrics.engagement_score = {
        score: Math.round(score * 100) / 100,
        factors
      }
    }

    // Calculate learning streak
    if (metrics.includes('learning_streak')) {
      const activeDays = result.daily_activity.filter(d => d.watch_time > 0).length
      const totalDaysInPeriod = result.daily_activity.length

      // Calculate current streak
      let currentStreak = 0
      const today = new Date().toISOString().split('T')[0]
      const checkDate = new Date()
      
      for (let i = 0; i < 365; i++) {
        const dayStr = checkDate.toISOString().split('T')[0]
        const hasActivity = result.daily_activity.find(d => d.date === dayStr && d.watch_time > 0)
        
        if (hasActivity) {
          currentStreak++
        } else if (dayStr !== today) {
          break
        }
        checkDate.setDate(checkDate.getDate() - 1)
      }

      // Calculate longest streak in period
      let longestStreak = 0
      let tempStreak = 0
      
      result.daily_activity.forEach(day => {
        if (day.watch_time > 0) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      })

      result.metrics.learning_streak = {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        active_days: activeDays,
        total_days_in_period: totalDaysInPeriod
      }
    }

    // Get course performance data
    if (metrics.includes('course_performance')) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses!inner(
            title,
            categories(name)
          )
        `)
        .eq('student_id', student_id)

      if (enrollments) {
        const coursePerformance: CoursePerformance[] = await Promise.all(
          enrollments.map(async (enrollment) => {
            const { data: progress } = await supabase
              .rpc('calculate_course_progress', {
                p_student_id: student_id,
                p_course_id: enrollment.course_id
              })

            const { data: timeData } = await supabase
              .from('lesson_progress')
              .select('watched_seconds, last_watched_at')
              .eq('student_id', student_id)
              .in('lesson_id',
                (await supabase
                  .from('lessons')
                  .select('id')
                  .eq('course_id', enrollment.course_id)
                ).data?.map(l => l.id) || []
              )
              .order('last_watched_at', { ascending: false })

            const timeSpent = timeData?.reduce((sum, t) => sum + (t.watched_seconds || 0), 0) || 0
            const lastActivity = timeData?.[0]?.last_watched_at || null

            const { data: lessonCounts } = await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', enrollment.course_id)
              .eq('is_published', true)

            const { data: completedLessons } = await supabase
              .from('lesson_progress')
              .select('lesson_id')
              .eq('student_id', student_id)
              .not('completed_at', 'is', null)
              .in('lesson_id', lessonCounts?.map(l => l.id) || [])

            // Calculate performance score (0-100)
            const progressScore = progress || 0
            const engagementScore = Math.min(100, timeSpent / (60 * 60) * 20) // 20 points per hour
            const performanceScore = (progressScore + engagementScore) / 2

            return {
              course_id: enrollment.course_id,
              course_title: enrollment.courses.title,
              category_name: enrollment.courses.categories?.name || null,
              progress_percentage: Math.round((progress || 0) * 100) / 100,
              time_spent: timeSpent,
              lessons_completed: completedLessons?.length || 0,
              total_lessons: lessonCounts?.length || 0,
              last_activity: lastActivity,
              performance_score: Math.round(performanceScore * 100) / 100
            }
          })
        )

        result.metrics.course_performance = coursePerformance
      }
    }

    // Calculate trends (simplified)
    const midPoint = new Date(fromDate.getTime() + (toDate.getTime() - fromDate.getTime()) / 2)
    
    // Enrollment trend
    const recentEnrollments = result.daily_activity
      .filter(d => new Date(d.date) >= midPoint)
      .reduce((sum, d) => sum + d.courses_accessed, 0)
    const earlierEnrollments = result.daily_activity
      .filter(d => new Date(d.date) < midPoint)
      .reduce((sum, d) => sum + d.courses_accessed, 0)

    if (recentEnrollments > earlierEnrollments * 1.2) {
      result.trends.enrollment_trend = 'increasing'
    } else if (recentEnrollments < earlierEnrollments * 0.8) {
      result.trends.enrollment_trend = 'decreasing'
    }

    // Engagement trend
    const recentWatchTime = result.daily_activity
      .filter(d => new Date(d.date) >= midPoint)
      .reduce((sum, d) => sum + d.watch_time, 0)
    const earlierWatchTime = result.daily_activity
      .filter(d => new Date(d.date) < midPoint)
      .reduce((sum, d) => sum + d.watch_time, 0)

    if (recentWatchTime > earlierWatchTime * 1.2) {
      result.trends.engagement_trend = 'improving'
    } else if (recentWatchTime < earlierWatchTime * 0.8) {
      result.trends.engagement_trend = 'declining'
    }

    // Performance trend (based on recent completions)
    const recentCompletions = result.daily_activity
      .filter(d => new Date(d.date) >= midPoint)
      .reduce((sum, d) => sum + d.lessons_completed, 0)
    const earlierCompletions = result.daily_activity
      .filter(d => new Date(d.date) < midPoint)
      .reduce((sum, d) => sum + d.lessons_completed, 0)

    if (recentCompletions > earlierCompletions * 1.2) {
      result.trends.performance_trend = 'improving'
    } else if (recentCompletions < earlierCompletions * 0.8) {
      result.trends.performance_trend = 'declining'
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getStudentAnalytics:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 