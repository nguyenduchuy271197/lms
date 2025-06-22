'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { exportCoursesSchema, type ExportCoursesInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface ExportCourseData {
  id: string
  title: string
  description: string | null
  objectives: string | null
  slug: string
  category_name: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  enrollments_count?: number
  lessons_count?: number
  completion_rate?: number
  total_watch_time?: number
}

interface ExportResult {
  filename: string
  data: string | ExportCourseData[]
  format: string
  total_records: number
}

type Result = 
  | { success: true; data: ExportResult }
  | { success: false; error: string }

export async function exportCourses(
  params: ExportCoursesInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = exportCoursesSchema.parse(params)
    const { format, filters, include_analytics } = validatedParams

    // Check admin authentication
    await requireAdmin()

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('courses')
      .select(`
        *,
        categories (
          name
        )
      `)

    // Apply filters
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }

    if (filters?.created_after) {
      query = query.gte('created_at', filters.created_after)
    }

    if (filters?.created_before) {
      query = query.lte('created_at', filters.created_before)
    }

    // Order by created_at
    query = query.order('created_at', { ascending: false })

    const { data: courses, error: coursesError } = await query

    if (coursesError) {
      console.error('Error getting courses:', coursesError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    if (!courses || courses.length === 0) {
      return { success: false, error: 'Không có dữ liệu để xuất' }
    }

    // Process course data
    const processedCourses: ExportCourseData[] = await Promise.all(
      courses.map(async (course) => {
        const baseData: ExportCourseData = {
          id: course.id,
          title: course.title,
          description: course.description,
          objectives: course.objectives,
          slug: course.slug,
          category_name: course.categories?.name || null,
          is_published: course.is_published,
          created_at: course.created_at,
          updated_at: course.updated_at,
        }

        // Add analytics data if requested
        if (include_analytics) {
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

          // Get total watch time
          const { data: lessonProgress } = await supabase
            .from('lesson_progress')
            .select(`
              watched_seconds,
              lessons!inner(course_id)
            `)
            .eq('lessons.course_id', course.id)

          const totalWatchTime = lessonProgress?.reduce((sum, progress) => 
            sum + (progress.watched_seconds || 0), 0) || 0

          baseData.enrollments_count = enrollmentsCount || 0
          baseData.lessons_count = lessonsCount || 0
          baseData.completion_rate = completionRate
          baseData.total_watch_time = totalWatchTime
        }

        return baseData
      })
    )

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `courses_export_${timestamp}.${format}`

    // Format data based on requested format
    let exportData: string | ExportCourseData[]

    switch (format) {
      case 'json':
        exportData = processedCourses
        break

      case 'csv':
        exportData = convertToCSV(processedCourses)
        break

      case 'xlsx':
        // For XLSX, we'll return the data as JSON and let the client handle Excel conversion
        // This is because server-side Excel generation requires additional dependencies
        exportData = processedCourses
        break

      default:
        return { success: false, error: 'Định dạng xuất không được hỗ trợ' }
    }

    const result: ExportResult = {
      filename,
      data: exportData,
      format,
      total_records: processedCourses.length,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Error in exportCourses:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

// Helper function to convert data to CSV format
function convertToCSV(data: ExportCourseData[]): string {
  if (data.length === 0) return ''

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV header row
  const csvHeaders = headers.join(',')
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header as keyof ExportCourseData]
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
} 