'use server'

import { createClient } from '@/lib/supabase/server'
import { exportDataSchema, type ExportDataInput } from '@/lib/validations/dashboard-analytics'
import { GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAdmin } from '@/lib/auth'
import type { EnrollmentStatus } from '@/types/custom.types'


// Define specific types for export data
type EnrollmentExportData = {
  id: string
  status: string
  enrolled_at: string
  completed_at: string | null
  student_name?: string
  student_email?: string
  course_title: string
  course_slug: string
  category_name: string | null
}

type ProgressExportData = {
  id: string
  watched_seconds: number
  completed_at: string | null
  last_watched_at: string
  student_name?: string
  student_email?: string
  lesson_title: string
  lesson_order: number
  course_title: string
}

type CourseAnalyticsExportData = {
  course_id: string
  course_title: string
  total_enrollments: number
  active_enrollments: number
  completed_enrollments: number
  completion_rate: number
  avg_progress: number
  category_name: string | null
}

type UserActivityExportData = {
  user_id: string
  user_name?: string
  user_email?: string
  activity_type: string
  activity_date: string
  course_title?: string
  lesson_title?: string
  details: string
}

type ExportDataType = EnrollmentExportData | ProgressExportData | CourseAnalyticsExportData | UserActivityExportData

interface ExportFilters {
  category_id?: string
  course_id?: string
  student_id?: string
  status?: EnrollmentStatus
  start_date?: string
  end_date?: string
}

// Supabase query result types
interface EnrollmentQueryResult {
  id: string
  status: string
  enrolled_at: string
  completed_at: string | null
  profiles?: {
    full_name: string | null
    email: string
  } | null
  courses?: {
    title: string
    slug: string
    categories?: {
      name: string
    } | null
  } | null
}

interface ProgressQueryResult {
  id: string
  watched_seconds: number
  completed_at: string | null
  last_watched_at: string
  profiles?: {
    full_name: string | null
    email: string
    id?: string
  } | null
  lessons?: {
    title: string
    order_index: number
    courses?: {
      title: string
    } | null
  } | null
}

interface CourseQueryResult {
  id: string
  title: string
  slug: string
  is_published: boolean
  created_at: string
  categories?: {
    name: string
  } | null
  enrollments?: Array<{
    status: string
    enrolled_at: string
    completed_at: string | null
  }> | null
}

interface ActivityQueryResult {
  id: string
  last_watched_at: string
  watched_seconds: number
  profiles?: {
    id: string
    full_name: string | null
    email: string
    created_at: string
  } | null
  lessons?: {
    title: string
    courses?: {
      title: string
    } | null
  } | null
}

export interface ExportDataResult {
  file_url: string
  file_name: string
  file_size: number
  record_count: number
  export_date: string
  expires_at: string
}

type Result = 
  | { success: true; data: ExportDataResult }
  | { success: false; error: string }

export async function exportData(
  params: ExportDataInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = exportDataSchema.parse(params)
    const { 
      export_type, 
      format, 
      period,
      filters, 
      include_details 
    } = validatedData

    // Calculate date range based on period
    const now = new Date()
    let start_date: string
    let end_date = now.toISOString()

    switch (period) {
      case '7d':
        start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '30d':
        start_date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '90d':
        start_date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '1y':
        start_date = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'all':
      default:
        start_date = new Date('2020-01-01').toISOString() // Start from a reasonable date
        break
    }

    // Override with filter dates if provided
    if (filters?.start_date) {
      start_date = filters.start_date
    }
    if (filters?.end_date) {
      end_date = filters.end_date
    }

    // Authentication & authorization check
    await requireAdmin()

    const supabase = await createClient()

    let exportData: ExportDataType[] = []
    let fileName = ''
    
    // Generate data based on export type
    switch (export_type) {
      case 'enrollments':
        const enrollmentResult = await exportEnrollmentData(supabase, start_date, end_date, filters || {}, include_details)
        exportData = enrollmentResult.data
        fileName = `enrollments_${new Date().toISOString().split('T')[0]}`
        break

      case 'lesson_progress':
        const progressResult = await exportStudentProgressData(supabase, start_date, end_date, filters || {}, include_details)
        exportData = progressResult.data
        fileName = `lesson_progress_${new Date().toISOString().split('T')[0]}`
        break

      case 'analytics':
        const courseResult = await exportCourseAnalyticsData(supabase, start_date, end_date, filters || {})
        exportData = courseResult.data
        fileName = `course_analytics_${new Date().toISOString().split('T')[0]}`
        break

      case 'students':
        const activityResult = await exportUserActivityData(supabase, start_date, end_date, filters || {}, include_details)
        exportData = activityResult.data
        fileName = `student_activity_${new Date().toISOString().split('T')[0]}`
        break

      case 'courses':
        // Would implement course data export
        exportData = []
        fileName = `courses_${new Date().toISOString().split('T')[0]}`
        break

      default:
        return { success: false, error: 'Loại xuất dữ liệu không hợp lệ' }
    }

    // Generate file content based on format
    let fileContent: string
    let mimeType: string
    let fileExtension: string

    switch (format) {
      case 'csv':
        fileContent = generateCSV(exportData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break

      case 'excel':
        // Would use a library like xlsx to generate Excel files
        fileContent = generateCSV(exportData) // Fallback to CSV for now
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
        break

      case 'json':
        fileContent = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        fileExtension = 'json'
        break

      case 'pdf':
        // Would use a library like puppeteer or jsPDF to generate PDF
        fileContent = generateCSV(exportData) // Fallback to CSV for now
        mimeType = 'application/pdf'
        fileExtension = 'pdf'
        break

      default:
        return { success: false, error: 'Định dạng xuất không hợp lệ' }
    }

    // Upload file to storage
    const fullFileName = `${fileName}.${fileExtension}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exports')
      .upload(`${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fullFileName}`, 
        new Blob([fileContent], { type: mimeType }), {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading export file:', uploadError)
      return { success: false, error: 'Không thể tạo file xuất dữ liệu' }
    }

    // Generate signed URL for download
    const { data: urlData, error: urlError } = await supabase.storage
      .from('exports')
      .createSignedUrl(uploadData.path, 86400) // 24 hours

    if (urlError) {
      console.error('Error creating signed URL:', urlError)
      return { success: false, error: 'Không thể tạo link tải xuống' }
    }

    const fileSize = new Blob([fileContent]).size
    const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString() // 24 hours from now

    const result: ExportDataResult = {
      file_url: urlData.signedUrl,
      file_name: fullFileName,
      file_size: fileSize,
      record_count: exportData.length,
      export_date: new Date().toISOString(),
      expires_at: expiresAt
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in exportData:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

// Helper function to export enrollment data
async function exportEnrollmentData(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  startDate: string, 
  endDate: string, 
  filters: ExportFilters, 
  includeDetails: boolean
): Promise<{ data: EnrollmentExportData[] }> {
  const selectFields = [
    'id',
    'status', 
    'enrolled_at',
    'completed_at',
    ...(includeDetails ? ['profiles(full_name,email)'] : []),
    'courses(title,slug,categories(name))'
  ].join(',')

  let query = supabase
    .from('enrollments')
    .select(selectFields)
    .gte('enrolled_at', startDate)
    .lte('enrolled_at', endDate)

  if (filters?.course_id) {
    query = query.eq('course_id', filters.course_id)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Transform data to match expected format
  const transformedData: EnrollmentExportData[] = (data as unknown as EnrollmentQueryResult[] || []).map((enrollment) => ({
    id: enrollment.id,
    status: enrollment.status,
    enrolled_at: enrollment.enrolled_at,
    completed_at: enrollment.completed_at,
    student_name: includeDetails ? enrollment.profiles?.full_name || undefined : undefined,
    student_email: includeDetails ? enrollment.profiles?.email : undefined,
    course_title: enrollment.courses?.title || '',
    course_slug: enrollment.courses?.slug || '',
    category_name: enrollment.courses?.categories?.name || null,
  }))

  return { data: transformedData }
}

// Helper function to export student progress data
async function exportStudentProgressData(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  startDate: string, 
  endDate: string, 
  filters: ExportFilters, 
  includeDetails: boolean
): Promise<{ data: ProgressExportData[] }> {
  const selectFields = [
    'id',
    'watched_seconds',
    'completed_at',
    'last_watched_at',
    ...(includeDetails ? ['profiles(full_name,email)'] : []),
    'lessons(title,order_index,courses(title,slug))'
  ].join(',')

  let query = supabase
    .from('lesson_progress')
    .select(selectFields)
    .gte('last_watched_at', startDate)
    .lte('last_watched_at', endDate)

  if (filters?.course_id) {
    query = query.eq('lessons.course_id', filters.course_id)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Transform data to match expected format
  const transformedData: ProgressExportData[] = (data as unknown as ProgressQueryResult[] || []).map((progress) => ({
    id: progress.id,
    watched_seconds: progress.watched_seconds,
    completed_at: progress.completed_at,
    last_watched_at: progress.last_watched_at,
    student_name: includeDetails ? progress.profiles?.full_name || undefined : undefined,
    student_email: includeDetails ? progress.profiles?.email : undefined,
    lesson_title: progress.lessons?.title || '',
    lesson_order: progress.lessons?.order_index || 0,
    course_title: progress.lessons?.courses?.title || '',
  }))

  return { data: transformedData }
}

// Helper function to export course analytics data
async function exportCourseAnalyticsData(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  startDate: string, 
  endDate: string, 
  filters: ExportFilters
): Promise<{ data: CourseAnalyticsExportData[] }> {
  let query = supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      is_published,
      created_at,
      categories (
        name
      ),
      enrollments (
        status,
        enrolled_at,
        completed_at
      )
    `)
    .eq('is_published', true)

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Process data to include analytics
  const processedData = (data as unknown as CourseQueryResult[] || []).map((course) => {
    const totalEnrollments = course.enrollments?.length || 0
    const completedEnrollments = course.enrollments?.filter((e: { status: string }) => e.status === 'completed').length || 0
    const activeEnrollments = course.enrollments?.filter((e: { status: string }) => e.status === 'active').length || 0
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0
    
    return {
      course_id: course.id,
      course_title: course.title,
      total_enrollments: totalEnrollments,
      active_enrollments: activeEnrollments,
      completed_enrollments: completedEnrollments,
      completion_rate: completionRate,
      avg_progress: 0, // Would need to calculate from lesson progress
      category_name: course.categories?.name || null,
    }
  })

  return { data: processedData }
}

// Helper function to export user activity data
async function exportUserActivityData(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  startDate: string, 
  endDate: string, 
  filters: ExportFilters, 
  includeDetails: boolean
): Promise<{ data: UserActivityExportData[] }> {
  // This would typically come from an activity log table
  // For now, we'll use lesson progress as a proxy for activity
  const selectFields = [
    'id',
    'last_watched_at',
    'watched_seconds',
    ...(includeDetails ? ['profiles(full_name,email,created_at)'] : []),
    'lessons(title,courses(title))'
  ].join(',')

  const query = supabase
    .from('lesson_progress')
    .select(selectFields)
    .gte('last_watched_at', startDate)
    .lte('last_watched_at', endDate)

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Transform data to match expected format
  const transformedData: UserActivityExportData[] = (data as unknown as ActivityQueryResult[] || []).map((activity) => ({
    user_id: activity.profiles?.id || '',
    user_name: includeDetails ? activity.profiles?.full_name || undefined : undefined,
    user_email: includeDetails ? activity.profiles?.email : undefined,
    activity_type: 'lesson_watch',
    activity_date: activity.last_watched_at,
    course_title: activity.lessons?.courses?.title,
    lesson_title: activity.lessons?.title,
    details: `Watched ${activity.watched_seconds} seconds`,
  }))

  return { data: transformedData }
}

// Helper function to generate CSV content
function generateCSV(data: ExportDataType[]): string {
  if (data.length === 0) {
    return ''
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header]
        // Handle nested objects and escape commas/quotes
        const stringValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value).replace(/"/g, '""')
          : String(value || '').replace(/"/g, '""')
        
        // Wrap in quotes if contains comma, quote, or newline
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue}"`
          : stringValue
      }).join(',')
    )
  ].join('\n')

  return csvContent
} 