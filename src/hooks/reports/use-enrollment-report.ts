'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getEnrollmentReport, type EnrollmentReportData } from '@/actions/reports/get-enrollment-report'
import type { GetEnrollmentReportInput } from '@/lib/validations/dashboard-analytics'

type UseEnrollmentReportOptions = Omit<
  UseQueryOptions<EnrollmentReportData, Error, EnrollmentReportData, string[]>,
  'queryKey' | 'queryFn'
>

export function useEnrollmentReport(
  params: GetEnrollmentReportInput,
  options?: UseEnrollmentReportOptions
) {
  return useQuery({
    queryKey: [
      'enrollment-report',
      params.start_date,
      params.end_date,
      params.category_id || 'all-categories',
      params.course_id || 'all-courses',
      params.status || 'all-statuses',
      params.group_by,
      String(params.include_details)
    ],
    queryFn: async () => {
      const result = await getEnrollmentReport(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    ...options,
  })
}

// Hook for summary enrollment report (without details)
export function useEnrollmentSummary(
  startDate: string,
  endDate: string,
  filters?: Partial<Pick<GetEnrollmentReportInput, 'category_id' | 'course_id' | 'status'>>,
  groupBy: GetEnrollmentReportInput['group_by'] = 'day',
  options?: UseEnrollmentReportOptions
) {
  return useEnrollmentReport(
    {
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
      include_details: false,
      ...filters
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes for summary
      ...options,
    }
  )
}

// Hook for detailed enrollment report
export function useDetailedEnrollmentReport(
  startDate: string,
  endDate: string,
  filters?: Partial<Pick<GetEnrollmentReportInput, 'category_id' | 'course_id' | 'status'>>,
  options?: UseEnrollmentReportOptions
) {
  return useEnrollmentReport(
    {
      start_date: startDate,
      end_date: endDate,
      group_by: 'day',
      include_details: true,
      ...filters
    },
    {
      staleTime: 1000 * 60 * 15, // 15 minutes for detailed report
      ...options,
    }
  )
}

// Hook for course-specific enrollment report
export function useCourseEnrollmentReport(
  courseId: string,
  startDate: string,
  endDate: string,
  options?: UseEnrollmentReportOptions
) {
  return useEnrollmentReport(
    {
      start_date: startDate,
      end_date: endDate,
      course_id: courseId,
      group_by: 'day',
      include_details: true
    },
    {
      enabled: Boolean(courseId),
      ...options,
    }
  )
}

// Hook for category enrollment analysis
export function useCategoryEnrollmentReport(
  categoryId: string,
  startDate: string,
  endDate: string,
  options?: UseEnrollmentReportOptions
) {
  return useEnrollmentReport(
    {
      start_date: startDate,
      end_date: endDate,
      category_id: categoryId,
      group_by: 'week',
      include_details: false
    },
    {
      enabled: Boolean(categoryId),
      ...options,
    }
  )
}

// Hook for enrollment trends analysis
export function useEnrollmentTrends(
  startDate: string,
  endDate: string,
  groupBy: GetEnrollmentReportInput['group_by'] = 'week',
  options?: UseEnrollmentReportOptions
) {
  return useEnrollmentReport(
    {
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
      include_details: false
    },
    {
      ...options,
    }
  )
}

// Hook for enrollment status analysis
export function useEnrollmentStatusReport(
  startDate: string,
  endDate: string,
  status?: GetEnrollmentReportInput['status'],
  options?: UseEnrollmentReportOptions
) {
  return useEnrollmentReport(
    {
      start_date: startDate,
      end_date: endDate,
      status,
      group_by: 'day',
      include_details: false
    },
    options
  )
} 