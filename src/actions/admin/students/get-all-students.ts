'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getAllStudentsAdminSchema, type GetAllStudentsAdminInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, DATABASE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface StudentWithStats {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
  enrollments_count: number
  active_enrollments: number
  completed_courses: number
  total_watch_time: number
  average_progress: number
}

interface GetAllStudentsResult {
  students: StudentWithStats[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  statistics: {
    total_students: number
    active_students: number
    students_with_enrollments: number
    average_completion_rate: number
  }
}

type Result = 
  | { success: true; data: GetAllStudentsResult }
  | { success: false; error: string }

export async function getAllStudents(params: GetAllStudentsAdminInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getAllStudentsAdminSchema.parse(params)
    const { 
      page, 
      limit, 
      search, 
      role, 
      enrollment_status, 
      sort_by, 
      sort_order, 
      date_from, 
      date_to,
      course_id 
    } = validatedParams

    // Check admin permissions
    await requireAdmin()

    const supabase = await createClient()
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build base query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role,
        created_at,
        updated_at
      `)

    // Apply role filter
    if (role) {
      query = query.eq('role', role)
    }

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply date filters
    if (date_from) {
      query = query.gte('created_at', date_from)
    }
    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await query

    if (countError) {
      console.error('Error getting students count:', countError)
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    // Apply sorting and pagination
    const sortColumn = sort_by === 'enrollments_count' || sort_by === 'completed_courses' 
      ? 'created_at' // We'll sort these after aggregating
      : sort_by

    query = query
      .order(sortColumn, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    if (!profiles) {
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    // Get enrollment statistics for each student
    const studentsWithStats: StudentWithStats[] = await Promise.all(
      profiles.map(async (profile) => {
        let enrollmentQuery = supabase
          .from('enrollments')
          .select(`
            id,
            status,
            enrolled_at,
            completed_at,
            courses!inner(id, title)
          `)
          .eq('student_id', profile.id)

        // Apply enrollment status filter
        if (enrollment_status) {
          enrollmentQuery = enrollmentQuery.eq('status', enrollment_status)
        }

        // Apply course filter
        if (course_id) {
          enrollmentQuery = enrollmentQuery.eq('course_id', course_id)
        }

        const { data: enrollments } = await enrollmentQuery

        // Get lesson progress for watch time and progress calculation
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select(`
            watched_seconds,
            completed_at,
            lessons!inner(
              course_id,
              duration_seconds
            )
          `)
          .eq('student_id', profile.id)

        const enrollmentsCount = enrollments?.length || 0
        const activeEnrollments = enrollments?.filter(e => e.status === 'active').length || 0
        const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0
        
        const totalWatchTime = progressData?.reduce((sum, p) => sum + (p.watched_seconds || 0), 0) || 0
        
        // Calculate average progress across all enrolled courses
        let averageProgress = 0
        if (enrollments && enrollments.length > 0) {
          const progressPromises = enrollments.map(async (enrollment) => {
            const { data: courseProgress } = await supabase
              .rpc('calculate_course_progress', {
                p_student_id: profile.id,
                p_course_id: enrollment.courses.id
              })
            return courseProgress || 0
          })
          
          const progressValues = await Promise.all(progressPromises)
          averageProgress = progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length
        }

        return {
          ...profile,
          enrollments_count: enrollmentsCount,
          active_enrollments: activeEnrollments,
          completed_courses: completedCourses,
          total_watch_time: totalWatchTime,
          average_progress: Math.round(averageProgress * 100) / 100
        }
      })
    )

    // Sort by computed fields if needed
    if (sort_by === 'enrollments_count' || sort_by === 'completed_courses') {
      studentsWithStats.sort((a, b) => {
        const aValue = sort_by === 'enrollments_count' ? a.enrollments_count : a.completed_courses
        const bValue = sort_by === 'enrollments_count' ? b.enrollments_count : b.completed_courses
        return sort_order === 'asc' ? aValue - bValue : bValue - aValue
      })
    }

    // Calculate statistics
    const totalStudents = totalCount || 0
    const activeStudents = studentsWithStats.filter(s => s.active_enrollments > 0).length
    const studentsWithEnrollments = studentsWithStats.filter(s => s.enrollments_count > 0).length
    const averageCompletionRate = studentsWithStats.length > 0 
      ? studentsWithStats.reduce((sum, s) => sum + s.average_progress, 0) / studentsWithStats.length
      : 0

    const totalPages = Math.ceil(totalStudents / limit)

    return {
      success: true,
      data: {
        students: studentsWithStats,
        total: totalStudents,
        page,
        limit,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
        statistics: {
          total_students: totalStudents,
          active_students: activeStudents,
          students_with_enrollments: studentsWithEnrollments,
          average_completion_rate: Math.round(averageCompletionRate * 100) / 100
        }
      }
    }

  } catch (error) {
    console.error('Error in getAllStudents:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 