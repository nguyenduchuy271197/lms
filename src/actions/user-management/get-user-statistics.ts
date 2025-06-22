'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  getUserStatisticsSchema,
  type GetUserStatisticsInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'

export interface UserStatistics {
  total_users: number
  total_students: number
  total_admins: number
  new_users_count: number
  active_users_count: number
  users_with_enrollments: number
  users_with_completed_courses: number
  period: string
  growth_rate: number
}

export async function getUserStatistics(
  input: GetUserStatisticsInput
): Promise<UserStatistics> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = getUserStatisticsSchema.parse(input)
    
    const supabase = await createClient()
    
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    
    switch (validatedInput.period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }
    
    // Get total users by role
    const { data: totalUsers } = await supabase
      .from('profiles')
      .select('role', { count: 'exact' })
    
    const { data: students } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'student')
    
    const { data: admins } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin')
    
    // Get new users in current period
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
    
    // Get new users in previous period for growth calculation
    const { data: previousNewUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())
    
    // Get users with enrollments
    const { data: usersWithEnrollments } = await supabase
      .from('enrollments')
      .select('student_id', { count: 'exact' })
      .not('student_id', 'is', null)
    
    // Get unique users with enrollments
    const uniqueEnrolledUsers = new Set(usersWithEnrollments?.map(e => e.student_id) || [])
    
    // Get users with completed courses
    const { data: usersWithCompletedCourses } = await supabase
      .from('enrollments')
      .select('student_id', { count: 'exact' })
      .eq('status', 'completed')
    
    const uniqueCompletedUsers = new Set(usersWithCompletedCourses?.map(e => e.student_id) || [])
    
    // Get users who have been active recently (have lesson progress in last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { data: activeUsers } = await supabase
      .from('lesson_progress')
      .select('student_id', { count: 'exact' })
      .gte('last_watched_at', thirtyDaysAgo.toISOString())
    
    const uniqueActiveUsers = new Set(activeUsers?.map(p => p.student_id) || [])
    
    // Calculate growth rate
    const currentCount = newUsers?.length || 0
    const previousCount = previousNewUsers?.length || 0
    const growthRate = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0
    
    return {
      total_users: totalUsers?.length || 0,
      total_students: students?.length || 0,
      total_admins: admins?.length || 0,
      new_users_count: currentCount,
      active_users_count: uniqueActiveUsers.size,
      users_with_enrollments: uniqueEnrolledUsers.size,
      users_with_completed_courses: uniqueCompletedUsers.size,
      period: validatedInput.period,
      growth_rate: Math.round(growthRate * 100) / 100,
    }
  } catch (error) {
    console.error('Error in getUserStatistics:', error)
    throw error instanceof Error ? error : new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
  }
} 