'use server'

import { createClient } from '@/lib/supabase/server'
import { getEnrollmentReportSchema, type GetEnrollmentReportInput } from '@/lib/validations/dashboard-analytics'
import { GENERIC_ERRORS } from '@/constants/error-messages'
import { requireAdmin } from '@/lib/auth'

export interface EnrollmentReportData {
  summary: {
    total_enrollments: number
    new_enrollments: number
    completed_enrollments: number
    dropped_enrollments: number
    conversion_rate: number
    avg_time_to_completion_days: number
    peak_enrollment_period: string
  }
  time_series: Array<{
    date: string
    new_enrollments: number
    completed_enrollments: number
    dropped_enrollments: number
    cumulative_enrollments: number
  }>
  category_breakdown: Array<{
    category_id: string
    category_name: string
    total_enrollments: number
    completion_rate: number
    avg_progress: number
    drop_rate: number
  }>
  course_breakdown: Array<{
    course_id: string
    course_title: string
    category_name: string
    total_enrollments: number
    completion_rate: number
    avg_progress: number
    avg_time_to_completion_days: number
  }>
  student_demographics: {
    enrollment_by_month: Array<{
      month: string
      new_students: number
      returning_students: number
    }>
    retention_analysis: Array<{
      cohort_month: string
      initial_enrollments: number
      month_1_retention: number
      month_3_retention: number
      month_6_retention: number
    }>
  }
  detailed_enrollments: Array<{
    enrollment_id: string
    student_id: string
    student_name: string
    student_email: string
    course_id: string
    course_title: string
    category_name: string
    enrollment_date: string
    completion_date: string | null
    status: string
    progress_percentage: number
    time_spent_hours: number
  }>
}

type Result = 
  | { success: true; data: EnrollmentReportData }
  | { success: false; error: string }

export async function getEnrollmentReport(
  params: GetEnrollmentReportInput
): Promise<Result> {
  try {
    // Validate input
    const validatedData = getEnrollmentReportSchema.parse(params)
    const { start_date, end_date, category_id, course_id, status, group_by, include_details } = validatedData

    // Authentication & authorization check
    await requireAdmin()

    const supabase = await createClient()

    // Build base query
    let enrollmentQuery = supabase
      .from('enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        enrolled_at,
        completed_at,
        profiles (
          id,
          full_name,
          email
        ),
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
      .gte('enrolled_at', start_date)
      .lte('enrolled_at', end_date)

    if (category_id) {
      enrollmentQuery = enrollmentQuery.eq('courses.category_id', category_id)
    }

    if (course_id) {
      enrollmentQuery = enrollmentQuery.eq('course_id', course_id)
    }

    if (status) {
      enrollmentQuery = enrollmentQuery.eq('status', status)
    }

    const { data: enrollments, error: enrollmentsError } = await enrollmentQuery

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
    }

    // Calculate summary stats
    const totalEnrollments = enrollments?.length || 0
    const newEnrollments = enrollments?.filter(e => 
      new Date(e.enrolled_at) >= new Date(start_date) && 
      new Date(e.enrolled_at) <= new Date(end_date)
    ).length || 0
    const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0
    const droppedEnrollments = enrollments?.filter(e => e.status === 'dropped').length || 0
    const conversionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

    // Calculate average time to completion
    const completedWithDates = enrollments?.filter(e => e.status === 'completed' && e.completed_at) || []
    const avgTimeToCompletion = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, e) => {
          const enrollDate = new Date(e.enrolled_at)
          const completeDate = new Date(e.completed_at!)
          const daysDiff = (completeDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24)
          return sum + daysDiff
        }, 0) / completedWithDates.length
      : 0

    // Group enrollments by time period for time series
    const groupedEnrollments = new Map<string, {
      new_enrollments: number
      completed_enrollments: number
      dropped_enrollments: number
    }>()

    enrollments?.forEach(enrollment => {
      const date = new Date(enrollment.enrolled_at)
      let groupKey: string

      switch (group_by) {
        case 'day':
          groupKey = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          groupKey = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          groupKey = date.toISOString().split('T')[0]
      }

      if (!groupedEnrollments.has(groupKey)) {
        groupedEnrollments.set(groupKey, {
          new_enrollments: 0,
          completed_enrollments: 0,
          dropped_enrollments: 0
        })
      }

      const group = groupedEnrollments.get(groupKey)!
      group.new_enrollments++
      
      if (enrollment.status === 'completed') {
        group.completed_enrollments++
      } else if (enrollment.status === 'dropped') {
        group.dropped_enrollments++
      }
    })

    // Build time series
    const timeSeries = Array.from(groupedEnrollments.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats], index, array) => ({
        date,
        ...stats,
        cumulative_enrollments: array.slice(0, index + 1).reduce((sum, [, s]) => sum + s.new_enrollments, 0)
      }))

    // Build category breakdown
    const categoryMap = new Map<string, {
      category_id: string
      category_name: string
      enrollments: typeof enrollments
    }>()

    enrollments?.forEach(enrollment => {
      const categoryId = enrollment.courses?.categories?.id || 'uncategorized'
      const categoryName = enrollment.courses?.categories?.name || 'Chưa phân loại'
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          category_id: categoryId,
          category_name: categoryName,
          enrollments: []
        })
      }
      
      categoryMap.get(categoryId)!.enrollments.push(enrollment)
    })

    const categoryBreakdown = Array.from(categoryMap.values()).map(category => {
      const totalEnrollments = category.enrollments.length
      const completedCount = category.enrollments.filter(e => e.status === 'completed').length
      const droppedCount = category.enrollments.filter(e => e.status === 'dropped').length
      const completionRate = totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0
      const dropRate = totalEnrollments > 0 ? (droppedCount / totalEnrollments) * 100 : 0

      return {
        category_id: category.category_id,
        category_name: category.category_name,
        total_enrollments: totalEnrollments,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_progress: 0, // Would need progress calculation
        drop_rate: Math.round(dropRate * 100) / 100
      }
    })

    // Build course breakdown
    const courseMap = new Map<string, typeof enrollments>()
    
    enrollments?.forEach(enrollment => {
      const courseId = enrollment.course_id
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, [])
      }
      courseMap.get(courseId)!.push(enrollment)
    })

    const courseBreakdown = Array.from(courseMap.entries()).map(([courseId, courseEnrollments]) => {
      const firstEnrollment = courseEnrollments[0]
      const totalEnrollments = courseEnrollments.length
      const completedCount = courseEnrollments.filter(e => e.status === 'completed').length
      const completionRate = totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0
      
      const courseCompletedWithDates = courseEnrollments.filter(e => e.status === 'completed' && e.completed_at)
      const avgTimeToCompletion = courseCompletedWithDates.length > 0 
        ? courseCompletedWithDates.reduce((sum, e) => {
            const enrollDate = new Date(e.enrolled_at)
            const completeDate = new Date(e.completed_at!)
            const daysDiff = (completeDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24)
            return sum + daysDiff
          }, 0) / courseCompletedWithDates.length
        : 0

      return {
        course_id: courseId,
        course_title: firstEnrollment.courses?.title || '',
        category_name: firstEnrollment.courses?.categories?.name || 'Chưa phân loại',
        total_enrollments: totalEnrollments,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_progress: 0, // Would need progress calculation
        avg_time_to_completion_days: Math.round(avgTimeToCompletion * 100) / 100
      }
    })

    // Build detailed enrollments (if requested)
    const detailedEnrollments = include_details 
      ? (enrollments || []).map(enrollment => ({
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          student_name: enrollment.profiles?.full_name || 'Chưa cập nhật',
          student_email: enrollment.profiles?.email || '',
          course_id: enrollment.course_id,
          course_title: enrollment.courses?.title || '',
          category_name: enrollment.courses?.categories?.name || 'Chưa phân loại',
          enrollment_date: enrollment.enrolled_at,
          completion_date: enrollment.completed_at,
          status: enrollment.status,
          progress_percentage: 0, // Would need progress calculation
          time_spent_hours: 0 // Would need lesson progress data
        }))
      : []

    const result: EnrollmentReportData = {
      summary: {
        total_enrollments: totalEnrollments,
        new_enrollments: newEnrollments,
        completed_enrollments: completedEnrollments,
        dropped_enrollments: droppedEnrollments,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        avg_time_to_completion_days: Math.round(avgTimeToCompletion * 100) / 100,
        peak_enrollment_period: timeSeries.length > 0 
          ? timeSeries.reduce((max, current) => 
              current.new_enrollments > max.new_enrollments ? current : max
            ).date
          : ''
      },
      time_series: timeSeries,
      category_breakdown: categoryBreakdown,
      course_breakdown: courseBreakdown,
      student_demographics: {
        enrollment_by_month: [], // Would need monthly aggregation
        retention_analysis: [] // Would need cohort analysis
      },
      detailed_enrollments: detailedEnrollments
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Error in getEnrollmentReport:', error)
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 