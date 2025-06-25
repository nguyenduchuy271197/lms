'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { bulkUpdateCoursesSchema, type BulkUpdateCoursesInput } from '@/lib/validations/admin-course-management'
import { AUTH_ERRORS, COURSE_ERRORS, GENERIC_ERRORS } from '@/constants/error-messages'
import type { Course } from '@/types/custom.types'

interface BulkUpdateResult {
  total_processed: number
  successful: number
  failed: number
  errors: Array<{
    course_id: string
    error: string
  }>
  updated_courses: Array<{
    id: string
    title: string
    action: string
  }>
}

type Result = 
  | { success: true; data: BulkUpdateResult }
  | { success: false; error: string }

export async function bulkUpdateCourses(
  params: BulkUpdateCoursesInput
): Promise<Result> {
  try {
    // Validate input
    const validatedParams = bulkUpdateCoursesSchema.parse(params)
    const { course_ids, action, data } = validatedParams

    // Check admin authentication
    await requireAdmin()

    const supabase = await createClient()

    // Verify all courses exist and get their details
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, is_published, category_id')
      .in('id', course_ids)

    if (coursesError) {
      console.error('Error getting courses:', coursesError)
      return { success: false, error: COURSE_ERRORS.COURSE_ACCESS_DENIED }
    }

    if (!courses || courses.length !== course_ids.length) {
      return { success: false, error: 'Một số khóa học không tồn tại' }
    }

    const result: BulkUpdateResult = {
      total_processed: course_ids.length,
      successful: 0,
      failed: 0,
      errors: [],
      updated_courses: [],
    }

    // Process each course based on action
    for (const course of courses) {
      try {
        let updateData: Partial<Course> = {}
        let actionDescription = ''
        let shouldUpdate = true

        switch (action) {
          case 'publish':
            // Check if course has required fields
            if (!course.title) {
              result.errors.push({
                course_id: course.id,
                error: 'Không thể xuất bản khóa học thiếu tiêu đề hoặc mô tả'
              })
              result.failed++
              continue
            }

            updateData = { is_published: true }
            actionDescription = 'Xuất bản'
            break

          case 'unpublish':
            updateData = { is_published: false }
            actionDescription = 'Hủy xuất bản'
            break

          case 'update_category':
            if (!data?.category_id) {
              result.errors.push({
                course_id: course.id,
                error: 'Thiếu thông tin danh mục'
              })
              result.failed++
              continue
            }

            // Verify category exists
            const { data: category, error: categoryError } = await supabase
              .from('categories')
              .select('id')
              .eq('id', data.category_id)
              .single()

            if (categoryError || !category) {
              result.errors.push({
                course_id: course.id,
                error: 'Danh mục không tồn tại'
              })
              result.failed++
              continue
            }

            updateData = { category_id: data.category_id }
            actionDescription = 'Cập nhật danh mục'
            break

          case 'delete':
            // Check if course has enrollments
            const { count: enrollmentsCount } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id)

            if (enrollmentsCount && enrollmentsCount > 0) {
              result.errors.push({
                course_id: course.id,
                error: 'Không thể xóa khóa học có học viên đăng ký'
              })
              result.failed++
              continue
            }

            // Delete course (this will cascade delete lessons due to foreign key)
            const { error: deleteError } = await supabase
              .from('courses')
              .delete()
              .eq('id', course.id)

            if (deleteError) {
              result.errors.push({
                course_id: course.id,
                error: 'Lỗi khi xóa khóa học'
              })
              result.failed++
              continue
            }

            result.successful++
            result.updated_courses.push({
              id: course.id,
              title: course.title,
              action: 'Đã xóa'
            })
            shouldUpdate = false

          default:
            result.errors.push({
              course_id: course.id,
              error: 'Hành động không hợp lệ'
            })
            result.failed++
            continue
        }

        // Perform update for non-delete actions
        if (shouldUpdate) {
          const { error: updateError } = await supabase
            .from('courses')
            .update({
              ...updateData,
              updated_at: new Date().toISOString()
            })
            .eq('id', course.id)

          if (updateError) {
            console.error(`Error updating course ${course.id}:`, updateError)
            result.errors.push({
              course_id: course.id,
              error: 'Lỗi khi cập nhật khóa học'
            })
            result.failed++
            continue
          }

          result.successful++
          result.updated_courses.push({
            id: course.id,
            title: course.title,
            action: actionDescription
          })
        }
      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error)
        result.errors.push({
          course_id: course.id,
          error: 'Lỗi không xác định'
        })
        result.failed++
      }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Error in bulkUpdateCourses:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { success: false, error: AUTH_ERRORS.ADMIN_REQUIRED }
    }

    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG }
  }
} 