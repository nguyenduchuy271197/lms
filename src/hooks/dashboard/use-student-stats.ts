'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getStudentDashboardStats, type StudentDashboardStats } from '@/actions/dashboard/get-student-stats'
import type { GetStudentDashboardStatsInput } from '@/lib/validations/dashboard-analytics'

type UseStudentStatsOptions = Omit<
  UseQueryOptions<StudentDashboardStats, Error, StudentDashboardStats, string[]>,
  'queryKey' | 'queryFn'
>

type MultipleStudentStats = {
  data: StudentDashboardStats[]
  errors?: string[]
}

type UseMultipleStudentStatsOptions = Omit<
  UseQueryOptions<MultipleStudentStats, Error, MultipleStudentStats, string[]>,
  'queryKey' | 'queryFn'
>

export function useStudentStats(
  params: GetStudentDashboardStatsInput,
  options?: UseStudentStatsOptions
) {
  return useQuery({
    queryKey: ['student-stats', params.student_id, params.period, String(params.include_details)],
    queryFn: async () => {
      const result = await getStudentDashboardStats(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    ...options,
  })
}

// Hook for getting current user's stats (convenience hook)
export function useMyStats(
  period: GetStudentDashboardStatsInput['period'] = '30d',
  includeDetails: boolean = false,
  options?: UseStudentStatsOptions
) {
  // This would typically get the current user ID from context/auth
  // For now, we'll pass a placeholder that needs to be replaced
  return useStudentStats(
    {
      student_id: 'current-user-id', // This should be replaced with actual user ID
      period,
      include_details: includeDetails
    },
    options
  )
}

// Hook with automatic refresh for real-time dashboards
export function useStudentStatsRealtime(
  params: GetStudentDashboardStatsInput,
  options?: UseStudentStatsOptions
) {
  return useStudentStats(params, {
    refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes
    refetchIntervalInBackground: false,
    ...options,
  })
}

// Hook for multiple students (admin use)
export function useMultipleStudentStats(
  studentIds: string[],
  period: GetStudentDashboardStatsInput['period'] = '30d',
  options?: UseMultipleStudentStatsOptions
) {
  return useQuery({
    queryKey: ['multiple-student-stats', ...studentIds, period],
    queryFn: async () => {
      const results = await Promise.allSettled(
        studentIds.map(studentId =>
          getStudentDashboardStats({
            student_id: studentId,
            period,
            include_details: false
          })
        )
      )

      const successfulResults: StudentDashboardStats[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successfulResults.push(result.value.data)
          } else {
            errors.push(`Student ${studentIds[index]}: ${result.value.error}`)
          }
        } else {
          errors.push(`Student ${studentIds[index]}: ${result.reason.message}`)
        }
      })

      if (errors.length > 0 && successfulResults.length === 0) {
        throw new Error(`Không thể tải dữ liệu cho bất kỳ học viên nào: ${errors.join(', ')}`)
      }

      return {
        data: successfulResults,
        errors: errors.length > 0 ? errors : undefined
      }
    },
    enabled: studentIds.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    ...options,
  })
} 