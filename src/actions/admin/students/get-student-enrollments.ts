'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getStudentEnrollmentsSchema, type GetStudentEnrollmentsInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, DATABASE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface EnrollmentWithProgress {
  id: string
  student_id: string
  course_id: string
  status: 'active' | 'completed' | 'dropped'
  enrolled_at: string
  completed_at: string | null
  course: {
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    slug: string
    is_published: boolean
    category: {
      id: string
      name: string
      slug: string
    } | null
  }
  progress?: {
    progress_percentage: number
    completed_lessons: number
    total_lessons: number
    total_watch_time: number
    last_activity: string | null
    estimated_completion_date: string | null
  }
}

interface GetStudentEnrollmentsResult {
  enrollments: EnrollmentWithProgress[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  summary: {
    total_enrollments: number
    active_enrollments: number
    completed_enrollments: number
    dropped_enrollments: number
    average_progress: number
  }
}

type Result = 
  | { success: true; data: GetStudentEnrollmentsResult }
  | { success: false; error: string }

export async function getStudentEnrollments(params: GetStudentEnrollmentsInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getStudentEnrollmentsSchema.parse(params)
    const { student_id, status, page, limit, sort_by, sort_order, include_progress } = validatedParams

    // Check admin permissions
    await requireAdmin()

    const supabase = await createClient()

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      console.error('Error fetching student:', studentError)
      return { success: false, error: 'Không tìm thấy học viên' }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build base query
    let query = supabase
      .from('enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        courses!inner(
          id,
          title,
          description,
          thumbnail_url,
          slug,
          is_published,
          categories(
            id,
            name,
            slug
          )
        )
      `)
      .eq('student_id', student_id)

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await query

    if (countError) {
      console.error('Error getting enrollments count:', countError)
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    // Apply sorting
    let sortColumn = 'enrolled_at'
    if (sort_by === 'completed_at') {
      sortColumn = 'completed_at'
    } else if (sort_by === 'progress') {
      // We'll sort by progress after fetching data
      sortColumn = 'enrolled_at'
    }

    query = query
      .order(sortColumn, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: enrollments, error: enrollmentsError } = await query

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    if (!enrollments) {
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    // Process enrollments and add progress if requested
    const enrollmentsWithProgress: EnrollmentWithProgress[] = await Promise.all(
      enrollments.map(async (enrollment) => {
        const result: EnrollmentWithProgress = {
          id: enrollment.id,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          course: {
            id: enrollment.courses.id,
            title: enrollment.courses.title,
            description: enrollment.courses.description,
            thumbnail_url: enrollment.courses.thumbnail_url,
            slug: enrollment.courses.slug,
            is_published: enrollment.courses.is_published,
            category: enrollment.courses.categories ? {
              id: enrollment.courses.categories.id,
              name: enrollment.courses.categories.name,
              slug: enrollment.courses.categories.slug
            } : null
          }
        }

        if (include_progress) {
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

          // Get watch time and last activity
          const { data: progressData } = await supabase
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

          const totalWatchTime = progressData?.reduce((sum, p) => sum + (p.watched_seconds || 0), 0) || 0
          const lastActivity = progressData?.[0]?.last_watched_at || null

          // Estimate completion date based on current progress and pace
          let estimatedCompletionDate: string | null = null
          if (enrollment.status === 'active' && progressPercentage && progressPercentage > 0) {
            const enrolledDate = new Date(enrollment.enrolled_at)
            const daysSinceEnrolled = Math.max(1, Math.floor((Date.now() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24)))
            const progressRate = progressPercentage / daysSinceEnrolled
            
            if (progressRate > 0) {
              const remainingProgress = 100 - progressPercentage
              const estimatedDaysToComplete = remainingProgress / progressRate
              const estimatedDate = new Date()
              estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(estimatedDaysToComplete))
              estimatedCompletionDate = estimatedDate.toISOString()
            }
          }

          result.progress = {
            progress_percentage: Math.round((progressPercentage || 0) * 100) / 100,
            completed_lessons: completedLessons?.length || 0,
            total_lessons: totalLessons?.length || 0,
            total_watch_time: totalWatchTime,
            last_activity: lastActivity,
            estimated_completion_date: estimatedCompletionDate
          }
        }

        return result
      })
    )

    // Sort by progress if requested
    if (sort_by === 'progress' && include_progress) {
      enrollmentsWithProgress.sort((a, b) => {
        const aProgress = a.progress?.progress_percentage || 0
        const bProgress = b.progress?.progress_percentage || 0
        return sort_order === 'asc' ? aProgress - bProgress : bProgress - aProgress
      })
    }

    // Calculate summary statistics
    const totalEnrollments = totalCount || 0
    const activeEnrollments = enrollmentsWithProgress.filter(e => e.status === 'active').length
    const completedEnrollments = enrollmentsWithProgress.filter(e => e.status === 'completed').length
    const droppedEnrollments = enrollmentsWithProgress.filter(e => e.status === 'dropped').length
    
    const averageProgress = include_progress && enrollmentsWithProgress.length > 0
      ? enrollmentsWithProgress
          .filter(e => e.progress)
          .reduce((sum, e) => sum + (e.progress?.progress_percentage || 0), 0) / enrollmentsWithProgress.filter(e => e.progress).length
      : 0

    const totalPages = Math.ceil(totalEnrollments / limit)

    return {
      success: true,
      data: {
        enrollments: enrollmentsWithProgress,
        total: totalEnrollments,
        page,
        limit,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
        summary: {
          total_enrollments: totalEnrollments,
          active_enrollments: activeEnrollments,
          completed_enrollments: completedEnrollments,
          dropped_enrollments: droppedEnrollments,
          average_progress: Math.round(averageProgress * 100) / 100
        }
      }
    }

  } catch (error) {
    console.error('Error in getStudentEnrollments:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 