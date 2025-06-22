'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getStudentDetailsSchema, type GetStudentDetailsInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, DATABASE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import { Profile, EnrollmentWithDetails } from '@/types/custom.types'

interface StudentProgress {
  course_id: string
  course_title: string
  progress_percentage: number
  completed_lessons: number
  total_lessons: number
  total_watch_time: number
  last_activity: string | null
  enrollment_status: 'active' | 'completed' | 'dropped'
}

interface StudentAnalytics {
  total_enrollments: number
  completed_courses: number
  active_courses: number
  dropped_courses: number
  total_watch_time: number
  average_progress: number
  learning_streak: number
  last_activity: string | null
  most_active_category: string | null
  performance_trend: 'improving' | 'declining' | 'stable'
}

interface StudentDetailsResult {
  student: Profile
  enrollments?: EnrollmentWithDetails[]
  progress?: StudentProgress[]
  analytics?: StudentAnalytics
}

type Result = 
  | { success: true; data: StudentDetailsResult }
  | { success: false; error: string }

export async function getStudentDetails(params: GetStudentDetailsInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getStudentDetailsSchema.parse(params)
    const { student_id, include_enrollments, include_progress, include_analytics } = validatedParams

    // Check admin permissions
    await requireAdmin()

    const supabase = await createClient()

    // Get student profile
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: 'Không tìm thấy học viên' }
    }

    const result: StudentDetailsResult = { student }

    // Get enrollments if requested
    if (include_enrollments) {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            description,
            thumbnail_url,
            slug,
            is_published,
            categories:category_id (
              id,
              name,
              slug
            )
          )
        `)
        .eq('student_id', student_id)
        .order('enrolled_at', { ascending: false })

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError)
        return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
      }

      result.enrollments = enrollments as EnrollmentWithDetails[]
    }

    // Get progress details if requested
    if (include_progress) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          status,
          courses!inner(id, title)
        `)
        .eq('student_id', student_id)

      if (enrollments) {
        const progressData: StudentProgress[] = await Promise.all(
          enrollments.map(async (enrollment) => {
            // Get course progress
            const { data: progressPercentage } = await supabase
              .rpc('calculate_course_progress', {
                p_student_id: student_id,
                p_course_id: enrollment.course_id
              })

            // Get lesson counts
            const { data: totalLessons } = await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', enrollment.course_id)
              .eq('is_published', true)

            const { data: completedLessons } = await supabase
              .from('lesson_progress')
              .select('lesson_id')
              .eq('student_id', student_id)
              .not('completed_at', 'is', null)
              .in('lesson_id', 
                (await supabase
                  .from('lessons')
                  .select('id')
                  .eq('course_id', enrollment.course_id)
                  .eq('is_published', true)
                ).data?.map(l => l.id) || []
              )

            // Get watch time for this course
            const { data: watchTime } = await supabase
              .from('lesson_progress')
              .select('watched_seconds')
              .eq('student_id', student_id)
              .in('lesson_id',
                (await supabase
                  .from('lessons')
                  .select('id')
                  .eq('course_id', enrollment.course_id)
                ).data?.map(l => l.id) || []
              )

            // Get last activity
            const { data: lastActivity } = await supabase
              .from('lesson_progress')
              .select('last_watched_at')
              .eq('student_id', student_id)
              .in('lesson_id',
                (await supabase
                  .from('lessons')
                  .select('id')
                  .eq('course_id', enrollment.course_id)
                ).data?.map(l => l.id) || []
              )
              .order('last_watched_at', { ascending: false })
              .limit(1)

            const totalWatchTime = watchTime?.reduce((sum, w) => sum + (w.watched_seconds || 0), 0) || 0

            return {
              course_id: enrollment.course_id,
              course_title: enrollment.courses.title,
              progress_percentage: progressPercentage || 0,
              completed_lessons: completedLessons?.length || 0,
              total_lessons: totalLessons?.length || 0,
              total_watch_time: totalWatchTime,
              last_activity: lastActivity?.[0]?.last_watched_at || null,
              enrollment_status: enrollment.status
            }
          })
        )

        result.progress = progressData
      }
    }

    // Get analytics if requested
    if (include_analytics) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', student_id)

      const { data: allProgress } = await supabase
        .from('lesson_progress')
        .select(`
          watched_seconds,
          completed_at,
          last_watched_at,
          lessons!inner(
            course_id,
            courses!inner(
              categories!inner(name)
            )
          )
        `)
        .eq('student_id', student_id)

      if (enrollments && allProgress) {
        const totalEnrollments = enrollments.length
        const completedCourses = enrollments.filter(e => e.status === 'completed').length
        const activeCourses = enrollments.filter(e => e.status === 'active').length
        const droppedCourses = enrollments.filter(e => e.status === 'dropped').length
        
        const totalWatchTime = allProgress.reduce((sum, p) => sum + (p.watched_seconds || 0), 0)
        
        // Calculate average progress across all courses
        let averageProgress = 0
        if (enrollments.length > 0) {
          const progressPromises = enrollments.map(async (enrollment) => {
            const { data: courseProgress } = await supabase
              .rpc('calculate_course_progress', {
                p_student_id: student_id,
                p_course_id: enrollment.course_id
              })
            return courseProgress || 0
          })
          
          const progressValues = await Promise.all(progressPromises)
          averageProgress = progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length
        }

        // Calculate learning streak (consecutive days with activity)
        const activityDates = allProgress
          .map(p => p.last_watched_at)
          .filter(date => date)
          .map(date => new Date(date).toDateString())
          .filter((date, index, arr) => arr.indexOf(date) === index)
          .sort()

        let learningStreak = 0
        if (activityDates.length > 0) {
          const today = new Date().toDateString()
          const currentDate = new Date()
          
          for (let i = 0; i < 365; i++) { // Check up to 1 year
            const checkDate = currentDate.toDateString()
            if (activityDates.includes(checkDate)) {
              learningStreak++
            } else if (checkDate !== today) {
              break
            }
            currentDate.setDate(currentDate.getDate() - 1)
          }
        }

        // Find most active category
        const categoryActivity: Record<string, number> = {}
        allProgress.forEach(p => {
          const categoryName = p.lessons.courses.categories?.name
          if (categoryName) {
            categoryActivity[categoryName] = (categoryActivity[categoryName] || 0) + (p.watched_seconds || 0)
          }
        })
        
        const mostActiveCategory = Object.keys(categoryActivity).length > 0
          ? Object.keys(categoryActivity).reduce((a, b) => 
              categoryActivity[a] > categoryActivity[b] ? a : b
            )
          : null

        // Determine performance trend (simplified)
        const recentActivity = allProgress
          .filter(p => p.last_watched_at)
          .sort((a, b) => new Date(b.last_watched_at!).getTime() - new Date(a.last_watched_at!).getTime())
          .slice(0, 10)

        const recentWatchTime = recentActivity.reduce((sum, p) => sum + (p.watched_seconds || 0), 0)
        const olderActivity = allProgress
          .filter(p => p.last_watched_at)
          .sort((a, b) => new Date(b.last_watched_at!).getTime() - new Date(a.last_watched_at!).getTime())
          .slice(10, 20)
        
        const olderWatchTime = olderActivity.reduce((sum, p) => sum + (p.watched_seconds || 0), 0)
        
        let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable'
        if (recentWatchTime > olderWatchTime * 1.2) {
          performanceTrend = 'improving'
        } else if (recentWatchTime < olderWatchTime * 0.8) {
          performanceTrend = 'declining'
        }

        const lastActivity = allProgress
          .filter(p => p.last_watched_at)
          .sort((a, b) => new Date(b.last_watched_at!).getTime() - new Date(a.last_watched_at!).getTime())[0]?.last_watched_at || null

        result.analytics = {
          total_enrollments: totalEnrollments,
          completed_courses: completedCourses,
          active_courses: activeCourses,
          dropped_courses: droppedCourses,
          total_watch_time: totalWatchTime,
          average_progress: Math.round(averageProgress * 100) / 100,
          learning_streak: learningStreak,
          last_activity: lastActivity,
          most_active_category: mostActiveCategory,
          performance_trend: performanceTrend
        }
      }
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getStudentDetails:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 