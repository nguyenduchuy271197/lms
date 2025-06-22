'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getAdminDashboardStats, type AdminDashboardStats } from '@/actions/dashboard/get-admin-stats'
import type { GetAdminDashboardStatsInput } from '@/lib/validations/dashboard-analytics'

type UseAdminStatsOptions = Omit<
  UseQueryOptions<AdminDashboardStats, Error, AdminDashboardStats, string[]>,
  'queryKey' | 'queryFn'
>

type AdminStatsComparison = {
  comparisons: Array<{
    period: string
    data: AdminDashboardStats
  }>
  errors?: string[]
}

type UseAdminStatsComparisonOptions = Omit<
  UseQueryOptions<AdminStatsComparison, Error, AdminStatsComparison, string[]>,
  'queryKey' | 'queryFn'
>

export function useAdminStats(
  params: Partial<GetAdminDashboardStatsInput> = {},
  options?: UseAdminStatsOptions
) {
  return useQuery({
    queryKey: [
      'admin-stats', 
      params.period || '30d', 
      String(params.include_trends ?? true), 
      String(params.include_breakdowns ?? true),
      params.category_id || 'all'
    ],
    queryFn: async () => {
      const fullParams: GetAdminDashboardStatsInput = {
        period: params.period || '30d',
        include_trends: params.include_trends ?? true,
        include_breakdowns: params.include_breakdowns ?? true,
        category_id: params.category_id,
      }
      
      const result = await getAdminDashboardStats(fullParams)
      
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

// Hook with automatic refresh for real-time admin dashboards
export function useAdminStatsRealtime(
  params: Partial<GetAdminDashboardStatsInput> = {},
  options?: UseAdminStatsOptions
) {
  return useAdminStats(params, {
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    refetchIntervalInBackground: false,
    ...options,
  })
}

// Hook for overview stats only (lighter query)
export function useAdminOverview(
  period: GetAdminDashboardStatsInput['period'] = '30d',
  options?: UseAdminStatsOptions
) {
  return useAdminStats(
    {
      period,
      include_trends: false,
      include_breakdowns: false
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes for overview
      ...options,
    }
  )
}

// Hook for detailed analytics with all breakdowns
export function useAdminDetailedStats(
  params: Partial<Omit<GetAdminDashboardStatsInput, 'include_trends' | 'include_breakdowns'>> = {},
  options?: UseAdminStatsOptions
) {
  return useAdminStats(
    {
      ...params,
      include_trends: true,
      include_breakdowns: true
    },
    {
      staleTime: 1000 * 60 * 15, // 15 minutes for detailed stats
      ...options,
    }
  )
}

// Hook for category-specific stats
export function useAdminCategoryStats(
  categoryId: string,
  period: GetAdminDashboardStatsInput['period'] = '30d',
  options?: UseAdminStatsOptions
) {
  return useAdminStats(
    {
      period,
      category_id: categoryId,
      include_trends: true,
      include_breakdowns: true
    },
    {
      enabled: Boolean(categoryId),
      ...options,
    }
  )
}

// Hook for comparing multiple time periods
export function useAdminStatsComparison(
  periods: GetAdminDashboardStatsInput['period'][],
  options?: UseAdminStatsComparisonOptions
) {
  return useQuery({
    queryKey: ['admin-stats-comparison', ...periods],
    queryFn: async () => {
      const results = await Promise.allSettled(
        periods.map(period =>
          getAdminDashboardStats({
            period,
            include_trends: true,
            include_breakdowns: false
          })
        )
      )

      const successfulResults: Array<{
        period: string
        data: AdminDashboardStats
      }> = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successfulResults.push({
              period: periods[index],
              data: result.value.data
            })
          } else {
            errors.push(`Period ${periods[index]}: ${result.value.error}`)
          }
        } else {
          errors.push(`Period ${periods[index]}: ${result.reason.message}`)
        }
      })

      if (errors.length > 0 && successfulResults.length === 0) {
        throw new Error(`Không thể tải dữ liệu cho bất kỳ khoảng thời gian nào: ${errors.join(', ')}`)
      }

      return {
        comparisons: successfulResults,
        errors: errors.length > 0 ? errors : undefined
      }
    },
    enabled: periods.length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    retry: 1,
    ...options,
  })
}

// Hook for admin stats with custom refresh interval
export function useAdminStatsWithInterval(
  params: Partial<GetAdminDashboardStatsInput> = {},
  refreshIntervalMs: number = 300000, // 5 minutes default
  options?: UseAdminStatsOptions
) {
  return useAdminStats(params, {
    refetchInterval: refreshIntervalMs,
    refetchIntervalInBackground: false,
    ...options,
  })
} 