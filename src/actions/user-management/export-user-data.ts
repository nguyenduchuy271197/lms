'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { 
  exportUserDataSchema,
  type ExportUserDataInput 
} from '@/lib/validations/user-management'
import { AUTH_ERRORS } from '@/constants/error-messages'

export interface ExportedUserData {
  users: Array<{
    id: string
    email: string
    full_name: string | null
    role: 'student' | 'admin'
    created_at: string
    updated_at: string
    enrollments?: Array<{
      course_title: string
      status: string
      enrolled_at: string
      completed_at: string | null
    }>
    progress?: Array<{
      lesson_title: string
      course_title: string
      watched_seconds: number
      completed_at: string | null
    }>
  }>
  export_date: string
  total_count: number
}

type EnhancedUser = ExportedUserData['users'][0]

export async function exportUserData(
  input: ExportUserDataInput
): Promise<ExportedUserData> {
  try {
    // Require admin permissions
    await requireAdmin()
    
    // Validate input
    const validatedInput = exportUserDataSchema.parse(input)
    
    const supabase = await createClient()
    
    // Build base query for users
    let usersQuery = supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })
    
    // Add role filter if provided
    if (validatedInput.role) {
      usersQuery = usersQuery.eq('role', validatedInput.role)
    }
    
    const { data: users, error: usersError } = await usersQuery
    
    if (usersError) {
      console.error('Error getting users for export:', usersError)
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    if (!users) {
      throw new Error(AUTH_ERRORS.PROFILE_NOT_FOUND)
    }
    
    // Enhance users data with enrollments and progress if requested
    const enhancedUsers = await Promise.all(
      users.map(async (user): Promise<EnhancedUser> => {
        const enhancedUser: EnhancedUser = { ...user }
        
        // Add enrollments if requested
        if (validatedInput.include_enrollments) {
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select(`
              status,
              enrolled_at,
              completed_at,
              courses (
                title
              )
            `)
            .eq('student_id', user.id)
          
          enhancedUser.enrollments = enrollments?.map(e => ({
            course_title: e.courses?.title || 'Khóa học không tên',
            status: e.status,
            enrolled_at: e.enrolled_at,
            completed_at: e.completed_at,
          })) || []
        }
        
        // Add progress if requested
        if (validatedInput.include_progress) {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select(`
              watched_seconds,
              completed_at,
              lessons (
                title,
                courses (
                  title
                )
              )
            `)
            .eq('student_id', user.id)
          
          enhancedUser.progress = progress?.map(p => ({
            lesson_title: p.lessons?.title || 'Bài học không tên',
            course_title: p.lessons?.courses?.title || 'Khóa học không tên',
            watched_seconds: p.watched_seconds || 0,
            completed_at: p.completed_at,
          })) || []
        }
        
        return enhancedUser
      })
    )
    
    return {
      users: enhancedUsers,
      export_date: new Date().toISOString(),
      total_count: enhancedUsers.length,
    }
  } catch (error) {
    console.error('Error in exportUserData:', error)
    throw error instanceof Error ? error : new Error('Xuất dữ liệu người dùng thất bại')
  }
} 