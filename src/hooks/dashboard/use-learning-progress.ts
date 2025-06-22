'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getLearningProgress, type LearningProgressData } from '@/actions/dashboard/get-learning-progress'
import type { GetLearningProgressInput } from '@/lib/validations/dashboard-analytics'

type UseLearningProgressOptions = Omit<
  UseQueryOptions<LearningProgressData, Error, LearningProgressData, string[]>,
  'queryKey' | 'queryFn'
>

type MultipleStudentsProgress = {
  students: Array<{
    studentId: string
    data: LearningProgressData
  }>
  errors?: string[]
}

type UseMultipleStudentsProgressOptions = Omit<
  UseQueryOptions<MultipleStudentsProgress, Error, MultipleStudentsProgress, string[]>,
  'queryKey' | 'queryFn'
>

export function useLearningProgress(
  params: GetLearningProgressInput,
  options?: UseLearningProgressOptions
) {
  return useQuery({
    queryKey: [
      'learning-progress',
      params.student_id,
      params.course_id || 'all-courses',
      params.period,
      String(params.include_predictions)
    ],
    queryFn: async () => {
      const result = await getLearningProgress(params)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    },
    enabled: Boolean(params.student_id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    ...options,
  })
}

// Hook for current user's learning progress
export function useMyLearningProgress(
  courseId?: string,
  period: GetLearningProgressInput['period'] = '30d',
  includePredictions: boolean = false,
  options?: UseLearningProgressOptions
) {
  return useLearningProgress(
    {
      student_id: 'current-user-id', // This should be replaced with actual user ID
      course_id: courseId,
      period,
      include_predictions: includePredictions
    },
    options
  )
}

// Hook for learning progress with predictions
export function useLearningProgressWithPredictions(
  studentId: string,
  courseId?: string,
  period: GetLearningProgressInput['period'] = '30d',
  options?: UseLearningProgressOptions
) {
  return useLearningProgress(
    {
      student_id: studentId,
      course_id: courseId,
      period,
      include_predictions: true
    },
    {
      staleTime: 1000 * 60 * 10, // 10 minutes for predictions
      ...options,
    }
  )
}

// Hook for course-specific learning progress
export function useCourseLearningProgress(
  studentId: string,
  courseId: string,
  period: GetLearningProgressInput['period'] = 'all',
  options?: UseLearningProgressOptions
) {
  return useLearningProgress(
    {
      student_id: studentId,
      course_id: courseId,
      period,
      include_predictions: false
    },
    {
      enabled: Boolean(studentId && courseId),
      ...options,
    }
  )
}

// Hook for overall learning progress (all courses)
export function useOverallLearningProgress(
  studentId: string,
  period: GetLearningProgressInput['period'] = '30d',
  options?: UseLearningProgressOptions
) {
  return useLearningProgress(
    {
      student_id: studentId,
      period,
      include_predictions: true
    },
    options
  )
}

// Hook for multiple students' learning progress (admin use)
export function useMultipleStudentsProgress(
  studentIds: string[],
  courseId?: string,
  period: GetLearningProgressInput['period'] = '30d',
  options?: UseMultipleStudentsProgressOptions
) {
  return useQuery({
    queryKey: ['multiple-students-progress', ...studentIds, courseId || 'all-courses', period],
    queryFn: async () => {
      const results = await Promise.allSettled(
        studentIds.map(studentId =>
          getLearningProgress({
            student_id: studentId,
            course_id: courseId,
            period,
            include_predictions: false
          })
        )
      )

      const successfulResults: Array<{
        studentId: string
        data: LearningProgressData
      }> = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successfulResults.push({
              studentId: studentIds[index],
              data: result.value.data
            })
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
        students: successfulResults,
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

// Hook with real-time updates for active learning sessions
export function useLearningProgressRealtime(
  studentId: string,
  courseId?: string,
  options?: UseLearningProgressOptions
) {
  return useLearningProgress(
    {
      student_id: studentId,
      course_id: courseId,
      period: '7d', // Focus on recent activity
      include_predictions: false
    },
    {
      refetchInterval: 1000 * 60 * 1, // Refresh every minute for active sessions
      refetchIntervalInBackground: false,
      ...options,
    }
  )
}

// Hook for learning analytics dashboard
export function useLearningAnalytics(
  studentId: string,
  period: GetLearningProgressInput['period'] = '90d',
  options?: UseLearningProgressOptions
) {
  return useLearningProgress(
    {
      student_id: studentId,
      period,
      include_predictions: true
    },
    {
      staleTime: 1000 * 60 * 15, // 15 minutes for analytics
      ...options,
    }
  )
} 