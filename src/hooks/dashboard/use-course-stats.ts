'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getCourseDashboardStats, type CourseDashboardStats } from '@/actions/dashboard/get-course-stats'
import type { GetCourseDashboardStatsInput } from '@/lib/validations/dashboard-analytics'

type UseCourseStatsOptions = Omit<
  UseQueryOptions<CourseDashboardStats, Error, CourseDashboardStats, string[]>,
  'queryKey' | 'queryFn'
>

type MultipleCourseStats = {
  courses: Array<{
    courseId: string
    data: CourseDashboardStats
  }>
  errors?: string[]
}

type UseMultipleCourseStatsOptions = Omit<
  UseQueryOptions<MultipleCourseStats, Error, MultipleCourseStats, string[]>,
  'queryKey' | 'queryFn'
>

export function useCourseStats(
  params: GetCourseDashboardStatsInput,
  options?: UseCourseStatsOptions
) {
  return useQuery({
    queryKey: [
      'course-stats',
      params.course_id,
      params.period,
      String(params.include_student_details),
      String(params.include_lesson_breakdown)
    ],
    queryFn: async () => {
      const result = await getCourseDashboardStats(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: Boolean(params.course_id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    ...options,
  })
}

// Hook for course overview only (without detailed breakdowns)
export function useCourseOverview(
  courseId: string,
  period: GetCourseDashboardStatsInput['period'] = '30d',
  options?: UseCourseStatsOptions
) {
  return useCourseStats(
    {
      course_id: courseId,
      period,
      include_student_details: false,
      include_lesson_breakdown: false
    },
    {
      staleTime: 1000 * 60 * 3, // 3 minutes for overview
      ...options,
    }
  )
}

// Hook for detailed course analytics (admin only)
export function useCourseDetailedStats(
  courseId: string,
  period: GetCourseDashboardStatsInput['period'] = '30d',
  options?: UseCourseStatsOptions
) {
  return useCourseStats(
    {
      course_id: courseId,
      period,
      include_student_details: true,
      include_lesson_breakdown: true
    },
    {
      staleTime: 1000 * 60 * 10, // 10 minutes for detailed stats
      ...options,
    }
  )
}

// Hook for lesson breakdown only
export function useCourseLessonBreakdown(
  courseId: string,
  period: GetCourseDashboardStatsInput['period'] = '30d',
  options?: UseCourseStatsOptions
) {
  return useCourseStats(
    {
      course_id: courseId,
      period,
      include_student_details: false,
      include_lesson_breakdown: true
    },
    options
  )
}

// Hook for student progress in course (admin only)
export function useCourseStudentProgress(
  courseId: string,
  period: GetCourseDashboardStatsInput['period'] = '30d',
  options?: UseCourseStatsOptions
) {
  return useCourseStats(
    {
      course_id: courseId,
      period,
      include_student_details: true,
      include_lesson_breakdown: false
    },
    options
  )
}

// Hook for multiple courses comparison
export function useMultipleCourseStats(
  courseIds: string[],
  period: GetCourseDashboardStatsInput['period'] = '30d',
  options?: UseMultipleCourseStatsOptions
) {
  return useQuery({
    queryKey: ['multiple-course-stats', ...courseIds, period],
    queryFn: async () => {
      const results = await Promise.allSettled(
        courseIds.map(courseId =>
          getCourseDashboardStats({
            course_id: courseId,
            period,
            include_student_details: false,
            include_lesson_breakdown: false
          })
        )
      )

      const successfulResults: Array<{
        courseId: string
        data: CourseDashboardStats
      }> = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successfulResults.push({
              courseId: courseIds[index],
              data: result.value.data
            })
          } else {
            errors.push(`Course ${courseIds[index]}: ${result.value.error}`)
          }
        } else {
          errors.push(`Course ${courseIds[index]}: ${result.reason.message}`)
        }
      })

      if (errors.length > 0 && successfulResults.length === 0) {
        throw new Error(`Không thể tải dữ liệu cho bất kỳ khóa học nào: ${errors.join(', ')}`)
      }

      return {
        courses: successfulResults,
        errors: errors.length > 0 ? errors : undefined
      }
    },
    enabled: courseIds.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    ...options,
  })
}

// Hook with real-time updates for course monitoring
export function useCourseStatsRealtime(
  courseId: string,
  period: GetCourseDashboardStatsInput['period'] = '30d',
  options?: UseCourseStatsOptions
) {
  return useCourseStats(
    {
      course_id: courseId,
      period,
      include_student_details: false,
      include_lesson_breakdown: true
    },
    {
      refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes
      refetchIntervalInBackground: false,
      ...options,
    }
  )
} 