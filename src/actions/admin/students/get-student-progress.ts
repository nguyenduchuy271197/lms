'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getStudentProgressSchema, type GetStudentProgressInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, DATABASE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface LessonProgressDetail {
  lesson_id: string
  lesson_title: string
  lesson_order: number
  watched_seconds: number
  total_duration: number
  completion_percentage: number
  completed_at: string | null
  last_watched_at: string
  is_completed: boolean
}

interface CourseProgressDetail {
  course_id: string
  course_title: string
  course_slug: string
  category_name: string | null
  enrollment_status: 'active' | 'completed' | 'dropped'
  enrolled_at: string
  completed_at: string | null
  overall_progress: number
  completed_lessons: number
  total_lessons: number
  total_watch_time: number
  estimated_completion_time: number
  lessons?: LessonProgressDetail[]
}

interface StudentProgressResult {
  student_id: string
  student_name: string | null
  courses: CourseProgressDetail[]
  summary: {
    total_courses: number
    active_courses: number
    completed_courses: number
    overall_progress: number
    total_watch_time: number
    learning_streak: number
    last_activity: string | null
  }
}

type Result = 
  | { success: true; data: StudentProgressResult }
  | { success: false; error: string }

export async function getStudentProgress(params: GetStudentProgressInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getStudentProgressSchema.parse(params)
    const { student_id, course_id, include_lessons, include_watch_time, status_filter } = validatedParams

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

    // Build enrollments query
    let enrollmentsQuery = supabase
      .from('enrollments')
      .select(`
        *,
        courses!inner(
          id,
          title,
          slug,
          categories(name)
        )
      `)
      .eq('student_id', student_id)

    // Apply course filter if specified
    if (course_id) {
      enrollmentsQuery = enrollmentsQuery.eq('course_id', course_id)
    }

    // Apply status filter
    if (status_filter !== 'all') {
      switch (status_filter) {
        case 'completed':
          enrollmentsQuery = enrollmentsQuery.eq('status', 'completed')
          break
        case 'in_progress':
          enrollmentsQuery = enrollmentsQuery.eq('status', 'active')
          break
        case 'not_started':
          // This would be courses with no progress, handled differently
          break
      }
    }

    const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery
      .order('enrolled_at', { ascending: false })

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    if (!enrollments) {
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    // Process each course's progress
    const courseProgressDetails: CourseProgressDetail[] = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get overall course progress
        const { data: progressPercentage } = await supabase
          .rpc('calculate_course_progress', {
            p_student_id: student_id,
            p_course_id: enrollment.course_id
          })

        // Get lesson counts
        const { data: allLessons } = await supabase
          .from('lessons')
          .select('id, title, order_index, duration_seconds')
          .eq('course_id', enrollment.course_id)
          .eq('is_published', true)
          .order('order_index')

        const totalLessons = allLessons?.length || 0

        // Get lesson progress
        const { data: lessonProgressData } = await supabase
          .from('lesson_progress')
          .select(`
            lesson_id,
            watched_seconds,
            completed_at,
            last_watched_at
          `)
          .eq('student_id', student_id)
          .in('lesson_id', allLessons?.map(l => l.id) || [])

        const completedLessons = lessonProgressData?.filter(lp => lp.completed_at).length || 0

        // Calculate total watch time for this course
        let totalWatchTime = 0
        if (include_watch_time && lessonProgressData) {
          totalWatchTime = lessonProgressData.reduce((sum, lp) => sum + (lp.watched_seconds || 0), 0)
        }

        // Estimate completion time based on remaining content and average pace
        const totalCourseDuration = allLessons?.reduce((sum, lesson) => sum + (lesson.duration_seconds || 0), 0) || 0
        const watchedTime = totalWatchTime
        const remainingTime = Math.max(0, totalCourseDuration - watchedTime)
        
        // Simple estimation: remaining time at current pace
        const estimatedCompletionTime = remainingTime

        // Prepare lesson details if requested
        let lessonDetails: LessonProgressDetail[] | undefined
        if (include_lessons && allLessons) {
          lessonDetails = allLessons.map(lesson => {
            const progress = lessonProgressData?.find(lp => lp.lesson_id === lesson.id)
            const watchedSeconds = progress?.watched_seconds || 0
            const totalDuration = lesson.duration_seconds || 0
            const completionPercentage = totalDuration > 0 ? Math.min(100, (watchedSeconds / totalDuration) * 100) : 0

            return {
              lesson_id: lesson.id,
              lesson_title: lesson.title,
              lesson_order: lesson.order_index,
              watched_seconds: watchedSeconds,
              total_duration: totalDuration,
              completion_percentage: Math.round(completionPercentage * 100) / 100,
              completed_at: progress?.completed_at || null,
              last_watched_at: progress?.last_watched_at || '',
              is_completed: !!progress?.completed_at
            }
          })
        }

        return {
          course_id: enrollment.course_id,
          course_title: enrollment.courses.title,
          course_slug: enrollment.courses.slug,
          category_name: enrollment.courses.categories?.name || null,
          enrollment_status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          overall_progress: Math.round((progressPercentage || 0) * 100) / 100,
          completed_lessons: completedLessons,
          total_lessons: totalLessons,
          total_watch_time: totalWatchTime,
          estimated_completion_time: estimatedCompletionTime,
          lessons: lessonDetails
        }
      })
    )

    // Calculate summary statistics
    const totalCourses = courseProgressDetails.length
    const activeCourses = courseProgressDetails.filter(c => c.enrollment_status === 'active').length
    const completedCourses = courseProgressDetails.filter(c => c.enrollment_status === 'completed').length
    const overallProgress = totalCourses > 0 
      ? courseProgressDetails.reduce((sum, c) => sum + c.overall_progress, 0) / totalCourses
      : 0
    const totalWatchTime = courseProgressDetails.reduce((sum, c) => sum + c.total_watch_time, 0)

    // Calculate learning streak
    const { data: recentActivity } = await supabase
      .from('lesson_progress')
      .select('last_watched_at')
      .eq('student_id', student_id)
      .not('last_watched_at', 'is', null)
      .order('last_watched_at', { ascending: false })

    let learningStreak = 0
    if (recentActivity && recentActivity.length > 0) {
      const activityDates = recentActivity
        .map(a => new Date(a.last_watched_at).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      const today = new Date().toDateString()
      const currentDate = new Date()
      
      for (let i = 0; i < 365; i++) {
        const checkDate = currentDate.toDateString()
        if (activityDates.includes(checkDate)) {
          learningStreak++
        } else if (checkDate !== today) {
          break
        }
        currentDate.setDate(currentDate.getDate() - 1)
      }
    }

    const lastActivity = recentActivity?.[0]?.last_watched_at || null

    return {
      success: true,
      data: {
        student_id,
        student_name: student.full_name,
        courses: courseProgressDetails,
        summary: {
          total_courses: totalCourses,
          active_courses: activeCourses,
          completed_courses: completedCourses,
          overall_progress: Math.round(overallProgress * 100) / 100,
          total_watch_time: totalWatchTime,
          learning_streak: learningStreak,
          last_activity: lastActivity
        }
      }
    }

  } catch (error) {
    console.error('Error in getStudentProgress:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 