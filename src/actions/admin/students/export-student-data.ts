'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { exportStudentDataSchema, type ExportStudentDataInput } from '@/lib/validations/admin-student-management'
import { AUTH_ERRORS, DATABASE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'

interface StudentExportData {
  student_info: {
    id: string
    email: string
    full_name: string | null
    role: string
    created_at: string
    updated_at: string
  }
  enrollments?: Array<{
    course_id: string
    course_title: string
    category_name: string | null
    status: string
    enrolled_at: string
    completed_at: string | null
    progress_percentage: number
  }>
  progress?: Array<{
    lesson_id: string
    lesson_title: string
    course_title: string
    watched_seconds: number
    completed_at: string | null
    last_watched_at: string
  }>
  analytics?: {
    total_enrollments: number
    completed_courses: number
    total_watch_time: number
    average_progress: number
    learning_streak: number
    most_active_category: string | null
  }
}

interface ExportStudentDataResult {
  file_name: string
  file_content: string
  mime_type: string
  total_students: number
  export_date: string
}

type Result = 
  | { success: true; data: ExportStudentDataResult }
  | { success: false; error: string }

export async function exportStudentData(params: ExportStudentDataInput): Promise<Result> {
  try {
    // Validate input
    const validatedParams = exportStudentDataSchema.parse(params)
    const { 
      student_ids, 
      format, 
      include_progress, 
      include_enrollments, 
      include_analytics,
      date_from,
      date_to,
      course_filter
    } = validatedParams

    // Check admin permissions
    await requireAdmin()

    const supabase = await createClient()

    // Build student query
    let studentsQuery = supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')

    // Apply student ID filter if provided
    if (student_ids && student_ids.length > 0) {
      studentsQuery = studentsQuery.in('id', student_ids)
    } else {
      // If no specific students, get all students
      studentsQuery = studentsQuery.eq('role', 'student')
    }

    // Apply date filters
    if (date_from) {
      studentsQuery = studentsQuery.gte('created_at', date_from)
    }
    if (date_to) {
      studentsQuery = studentsQuery.lte('created_at', date_to)
    }

    const { data: students, error: studentsError } = await studentsQuery
      .order('created_at', { ascending: false })

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return { success: false, error: DATABASE_ERRORS.QUERY_FAILED }
    }

    if (!students || students.length === 0) {
      return { success: false, error: 'Không tìm thấy học viên nào' }
    }

    // Process each student's data
    const exportData: StudentExportData[] = await Promise.all(
      students.map(async (student) => {
        const studentData: StudentExportData = {
          student_info: {
            id: student.id,
            email: student.email,
            full_name: student.full_name,
            role: student.role,
            created_at: student.created_at,
            updated_at: student.updated_at
          }
        }

        // Get enrollments if requested
        if (include_enrollments) {
          let enrollmentsQuery = supabase
            .from('enrollments')
            .select(`
              course_id,
              status,
              enrolled_at,
              completed_at,
              courses!inner(
                title,
                categories(name)
              )
            `)
            .eq('student_id', student.id)

          // Apply course filter
          if (course_filter) {
            enrollmentsQuery = enrollmentsQuery.eq('course_id', course_filter)
          }

          const { data: enrollments } = await enrollmentsQuery
            .order('enrolled_at', { ascending: false })

          if (enrollments) {
            const enrollmentData = await Promise.all(
              enrollments.map(async (enrollment) => {
                // Get progress for this enrollment
                const { data: progressPercentage } = await supabase
                  .rpc('calculate_course_progress', {
                    p_student_id: student.id,
                    p_course_id: enrollment.course_id
                  })

                return {
                  course_id: enrollment.course_id,
                  course_title: enrollment.courses.title,
                  category_name: enrollment.courses.categories?.name || null,
                  status: enrollment.status,
                  enrolled_at: enrollment.enrolled_at,
                  completed_at: enrollment.completed_at,
                  progress_percentage: Math.round((progressPercentage || 0) * 100) / 100
                }
              })
            )

            studentData.enrollments = enrollmentData
          }
        }

        // Get progress details if requested
        if (include_progress) {
          let progressQuery = supabase
            .from('lesson_progress')
            .select(`
              lesson_id,
              watched_seconds,
              completed_at,
              last_watched_at,
              lessons!inner(
                title,
                courses!inner(title)
              )
            `)
            .eq('student_id', student.id)

          // Apply course filter to progress
          if (course_filter) {
            progressQuery = progressQuery.in('lesson_id',
              (await supabase
                .from('lessons')
                .select('id')
                .eq('course_id', course_filter)
              ).data?.map(l => l.id) || []
            )
          }

          const { data: progressData } = await progressQuery
            .order('last_watched_at', { ascending: false })

          if (progressData) {
            studentData.progress = progressData.map(p => ({
              lesson_id: p.lesson_id,
              lesson_title: p.lessons.title,
              course_title: p.lessons.courses.title,
              watched_seconds: p.watched_seconds || 0,
              completed_at: p.completed_at,
              last_watched_at: p.last_watched_at
            }))
          }
        }

        // Get analytics if requested
        if (include_analytics) {
          const { data: allEnrollments } = await supabase
            .from('enrollments')
            .select('*')
            .eq('student_id', student.id)

          const { data: allProgress } = await supabase
            .from('lesson_progress')
            .select(`
              watched_seconds,
              lessons!inner(
                courses!inner(
                  categories!inner(name)
                )
              )
            `)
            .eq('student_id', student.id)

          if (allEnrollments && allProgress) {
            const totalEnrollments = allEnrollments.length
            const completedCourses = allEnrollments.filter(e => e.status === 'completed').length
            const totalWatchTime = allProgress.reduce((sum, p) => sum + (p.watched_seconds || 0), 0)

            // Calculate average progress
            let averageProgress = 0
            if (allEnrollments.length > 0) {
              const progressPromises = allEnrollments.map(async (enrollment) => {
                const { data: courseProgress } = await supabase
                  .rpc('calculate_course_progress', {
                    p_student_id: student.id,
                    p_course_id: enrollment.course_id
                  })
                return courseProgress || 0
              })
              
              const progressValues = await Promise.all(progressPromises)
              averageProgress = progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length
            }

            // Calculate learning streak (simplified)
            const { data: recentActivity } = await supabase
              .from('lesson_progress')
              .select('last_watched_at')
              .eq('student_id', student.id)
              .not('last_watched_at', 'is', null)
              .order('last_watched_at', { ascending: false })

            let learningStreak = 0
            if (recentActivity && recentActivity.length > 0) {
              const activityDates = recentActivity
                .map(a => new Date(a.last_watched_at).toDateString())
                .filter((date, index, arr) => arr.indexOf(date) === index)

              const today = new Date().toDateString()
              const currentDate = new Date()
              
              for (let i = 0; i < 30; i++) { // Check last 30 days
                const checkDate = currentDate.toDateString()
                if (activityDates.includes(checkDate)) {
                  learningStreak++
                } else if (checkDate !== today) {
                  break
                }
                currentDate.setDate(currentDate.getDate() - 1)
              }
            }

            // Find most active category
            const categoryActivity: Record<string, number> = {}
            allProgress.forEach(p => {
              const categoryName = p.lessons.courses.categories?.name
              if (categoryName) {
                categoryActivity[categoryName] = (categoryActivity[categoryName] || 0) + (p.watched_seconds || 0)
              }
            })
            
            const mostActiveCategory = Object.keys(categoryActivity).length > 0
              ? Object.keys(categoryActivity).reduce((a, b) => 
                  categoryActivity[a] > categoryActivity[b] ? a : b
                )
              : null

            studentData.analytics = {
              total_enrollments: totalEnrollments,
              completed_courses: completedCourses,
              total_watch_time: totalWatchTime,
              average_progress: Math.round(averageProgress * 100) / 100,
              learning_streak: learningStreak,
              most_active_category: mostActiveCategory
            }
          }
        }

        return studentData
      })
    )

    // Generate file content based on format
    let fileContent: string
    let mimeType: string
    let fileName: string

    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'csv':
        fileContent = generateCSV(exportData)
        mimeType = 'text/csv'
        fileName = `student-data-export-${timestamp}.csv`
        break
      
      case 'xlsx':
        // For XLSX, we'll return CSV format with XLSX mime type
        // In a real implementation, you'd use a library like xlsx
        fileContent = generateCSV(exportData)
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileName = `student-data-export-${timestamp}.xlsx`
        break
      
      case 'json':
      default:
        fileContent = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        fileName = `student-data-export-${timestamp}.json`
        break
    }

    return {
      success: true,
      data: {
        file_name: fileName,
        file_content: fileContent,
        mime_type: mimeType,
        total_students: exportData.length,
        export_date: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Error in exportStudentData:', error)
    
    if (error instanceof Error && error.message === AUTH_ERRORS.ADMIN_REQUIRED) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
}

function generateCSV(data: StudentExportData[]): string {
  if (data.length === 0) return ''

  const headers = [
    'Student ID',
    'Email',
    'Full Name',
    'Role',
    'Created At',
    'Updated At',
    'Total Enrollments',
    'Completed Courses',
    'Total Watch Time (seconds)',
    'Average Progress (%)',
    'Learning Streak',
    'Most Active Category'
  ]

  const rows = data.map(student => [
    student.student_info.id,
    student.student_info.email,
    student.student_info.full_name || '',
    student.student_info.role,
    student.student_info.created_at,
    student.student_info.updated_at,
    student.analytics?.total_enrollments || 0,
    student.analytics?.completed_courses || 0,
    student.analytics?.total_watch_time || 0,
    student.analytics?.average_progress || 0,
    student.analytics?.learning_streak || 0,
    student.analytics?.most_active_category || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
} 