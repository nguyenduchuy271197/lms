'use server'

import { createClient } from '@/lib/supabase/server'
import { getLearningProgressSchema, type GetLearningProgressInput } from '@/lib/validations/dashboard-analytics'
import { AUTH_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAuth } from '@/lib/auth'

export interface LearningProgressData {
  overview: {
    student_id: string
    student_name: string
    total_courses_enrolled: number
    total_courses_completed: number
    total_lessons_completed: number
    total_watch_time_hours: number
    overall_progress_percentage: number
    current_learning_streak_days: number
    longest_learning_streak_days: number
  }
  course_progress: Array<{
    course_id: string
    course_title: string
    course_slug: string
    category_name: string
    enrollment_date: string
    progress_percentage: number
    lessons_completed: number
    total_lessons: number
    estimated_completion_date: string
    status: string
    last_activity: string
    time_spent_hours: number
  }>
  recent_achievements: Array<{
    id: string
    type: 'lesson_completion' | 'course_completion' | 'streak_milestone' | 'time_milestone'
    title: string
    description: string
    achieved_at: string
    course_title?: string
    lesson_title?: string
  }>
  learning_patterns: {
    preferred_study_hours: Array<{
      hour: number
      activity_count: number
      avg_duration_minutes: number
    }>
    weekly_activity: Array<{
      day_of_week: number
      lessons_completed: number
      time_spent_minutes: number
    }>
    monthly_progress: Array<{
      month: string
      courses_completed: number
      lessons_completed: number
      watch_time_hours: number
    }>
  }
  predictions: {
    estimated_completion_dates: Array<{
      course_id: string
      course_title: string
      estimated_date: string
      confidence: number
    }>
    recommended_study_schedule: Array<{
      day: string
      recommended_hours: number
      suggested_courses: string[]
    }>
    skill_gap_analysis: Array<{
      category: string
      current_level: number
      target_level: number
      recommended_courses: string[]
    }>
  }
}

type Result = 
  | { success: true; data: LearningProgressData }
  | { success: false; error: string }

export async function getLearningProgress(
  params: GetLearningProgressInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = getLearningProgressSchema.parse(params)
    const { student_id, course_id, period, include_predictions } = validatedData

    // Authentication check
    const user = await requireAuth()
    
    // Permission check - students can only view their own progress, admins can view any
    if (user.profile.role === 'student' && user.id !== student_id) {
      return { success: false, error: AUTH_ERRORS.FORBIDDEN }
    }

    const supabase = await createClient()

    // Get student profile
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Không tìm thấy học viên' }
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

    // Get student enrollments
    const enrollmentQuery = supabase
      .from('enrollments')
      .select(`
        id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        courses (
          id,
          title,
          slug,
          categories (
            id,
            name
          )
        )
      `)
      .eq('student_id', student_id)
      .gte('enrolled_at', startDate?.toISOString() || '1970-01-01')

    if (course_id) {
      enrollmentQuery.eq('course_id', course_id)
    }

    const { data: enrollments, error: enrollmentsError } = await enrollmentQuery

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Get lesson progress
    const { data: lessonProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        id,
        lesson_id,
        watched_seconds,
        completed_at,
        last_watched_at,
        lessons (
          id,
          title,
          course_id,
          order_index,
          courses (
            id,
            title,
            slug
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
    const totalCoursesEnrolled = enrollments?.length || 0
    const totalCoursesCompleted = enrollments?.filter(e => e.status === 'completed').length || 0
    const totalLessonsCompleted = lessonProgress?.filter(lp => lp.completed_at).length || 0
    const totalWatchTimeSeconds = lessonProgress?.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0) || 0
    const totalWatchTimeHours = Math.round(totalWatchTimeSeconds / 3600 * 100) / 100

    // Calculate overall progress
    let overallProgress = 0
    if (enrollments && enrollments.length > 0) {
      const progressPromises = enrollments.map(async (enrollment) => {
        const { data } = await supabase.rpc('calculate_course_progress', {
          p_student_id: student_id,
          p_course_id: enrollment.course_id
        })
        return data || 0
      })
      
      const progressResults = await Promise.all(progressPromises)
      overallProgress = progressResults.reduce((sum, progress) => sum + progress, 0) / progressResults.length
    }

    // Calculate learning streak (simplified)
    const currentStreak = 0 // Would need daily activity tracking
    const longestStreak = 0 // Would need historical data

    // Build course progress
    const courseProgress = await Promise.all((enrollments || []).map(async (enrollment) => {
      const { data: progress } = await supabase.rpc('calculate_course_progress', {
        p_student_id: student_id,
        p_course_id: enrollment.course_id
      })

      // Get total lessons for this course
      const { data: courseLessons } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('course_id', enrollment.course_id)
        .eq('is_published', true)

      const totalLessons = courseLessons?.length || 0
      const courseLessonProgress = lessonProgress?.filter(lp => lp.lessons?.course_id === enrollment.course_id) || []
      const lessonsCompleted = courseLessonProgress.filter(lp => lp.completed_at).length
      const timeSpentSeconds = courseLessonProgress.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0)
      const lastActivity = courseLessonProgress
        .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())[0]?.last_watched_at || enrollment.enrolled_at

      return {
        course_id: enrollment.course_id,
        course_title: enrollment.courses?.title || '',
        course_slug: enrollment.courses?.slug || '',
        category_name: enrollment.courses?.categories?.name || 'Chưa phân loại',
        enrollment_date: enrollment.enrolled_at,
        progress_percentage: Math.round((progress || 0) * 100) / 100,
        lessons_completed: lessonsCompleted,
        total_lessons: totalLessons,
        estimated_completion_date: '', // Would need prediction algorithm
        status: enrollment.status,
        last_activity: lastActivity,
        time_spent_hours: Math.round(timeSpentSeconds / 3600 * 100) / 100
      }
    }))

    // Build recent achievements (simplified)
    const recentAchievements = [
      ...lessonProgress?.filter(lp => lp.completed_at).slice(0, 5).map(lp => ({
        id: lp.id,
        type: 'lesson_completion' as const,
        title: 'Hoàn thành bài học',
        description: `Đã hoàn thành bài học "${lp.lessons?.title}"`,
        achieved_at: lp.completed_at!,
        course_title: lp.lessons?.courses?.title,
        lesson_title: lp.lessons?.title
      })) || [],
      ...enrollments?.filter(e => e.status === 'completed' && e.completed_at).slice(0, 3).map(e => ({
        id: e.id,
        type: 'course_completion' as const,
        title: 'Hoàn thành khóa học',
        description: `Đã hoàn thành khóa học "${e.courses?.title}"`,
        achieved_at: e.completed_at!,
        course_title: e.courses?.title
      })) || []
    ].sort((a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime()).slice(0, 10)

    // Build learning patterns (simplified)
    const learningPatterns = {
      preferred_study_hours: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activity_count: 0, // Would need hourly activity tracking
        avg_duration_minutes: 0
      })),
      weekly_activity: Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        lessons_completed: 0, // Would need daily aggregation
        time_spent_minutes: 0
      })),
      monthly_progress: [] // Would need monthly aggregation
    }

    // Build predictions (if requested)
    const predictions = include_predictions ? {
      estimated_completion_dates: courseProgress.filter(cp => cp.status === 'active').map(cp => ({
        course_id: cp.course_id,
        course_title: cp.course_title,
        estimated_date: '', // Would need prediction algorithm
        confidence: 0.75
      })),
      recommended_study_schedule: [], // Would need AI/ML algorithm
      skill_gap_analysis: [] // Would need skill mapping
    } : {
      estimated_completion_dates: [],
      recommended_study_schedule: [],
      skill_gap_analysis: []
    }

    const result: LearningProgressData = {
      overview: {
        student_id: student.id,
        student_name: student.full_name || 'Chưa cập nhật',
        total_courses_enrolled: totalCoursesEnrolled,
        total_courses_completed: totalCoursesCompleted,
        total_lessons_completed: totalLessonsCompleted,
        total_watch_time_hours: totalWatchTimeHours,
        overall_progress_percentage: Math.round(overallProgress * 100) / 100,
        current_learning_streak_days: currentStreak,
        longest_learning_streak_days: longestStreak
      },
      course_progress: courseProgress,
      recent_achievements: recentAchievements,
      learning_patterns: learningPatterns,
      predictions: predictions
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getLearningProgress:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 