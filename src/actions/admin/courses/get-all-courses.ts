'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { getAllCoursesAdminSchema, type GetAllCoursesAdminInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import type { Course, Category } from '@/types/custom.types'

interface CourseWithDetails extends Course {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null
  enrollments_count: number
  lessons_count: number
  completion_rate: number
}

interface PaginatedCoursesResponse {
  courses: CourseWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

type Result = 
  | { success: true; data: PaginatedCoursesResponse }
  | { success: false; error: string }

export async function getAllCoursesAdmin(
  params: GetAllCoursesAdminInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = getAllCoursesAdminSchema.parse(params)
    const { page, limit, search, category_id, is_published, sort_by, sort_order } = validatedParams

    // Check admin authentication
    await requireAdmin()

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('courses')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    if (is_published !== undefined) {
      query = query.eq('is_published', is_published)
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await query

    if (countError) {
      console.error('Error getting courses count:', countError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    // Apply sorting and pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(from, to)

    const { data: coursesData, error: coursesError } = await query

    if (coursesError) {
      console.error('Error getting courses:', coursesError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    // Get additional statistics for each course
    const coursesWithStats: CourseWithDetails[] = await Promise.all(
      (coursesData || []).map(async (course) => {
        // Get enrollments count
        const { count: enrollmentsCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)

        // Get lessons count
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('is_published', true)

        // Get completion rate
        const { count: completedEnrollments } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('status', 'completed')

        const completionRate = enrollmentsCount && enrollmentsCount > 0 
          ? Math.round(((completedEnrollments || 0) / enrollmentsCount) * 100)
          : 0

        return {
          ...course,
          enrollments_count: enrollmentsCount || 0,
          lessons_count: lessonsCount || 0,
          completion_rate: completionRate,
        }
      })
    )

    const totalPages = Math.ceil((totalCount || 0) / limit)

    const response: PaginatedCoursesResponse = {
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    }

    return { success: true, data: response }
  } catch (error) {
    console.error('Error in getAllCoursesAdmin:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 