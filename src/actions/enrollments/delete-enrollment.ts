"use server"

import { createClient } from "@/lib/supabase/server"
import { deleteEnrollmentSchema, type DeleteEnrollmentInput } from "@/lib/validations/enrollment"
import { ENROLLMENT_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; message: string }
  | { success: false; error: string }

export async function deleteEnrollment(params: DeleteEnrollmentInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = deleteEnrollmentSchema.parse(params)

    // 2. Check admin permission (only admins can delete enrollments)
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if enrollment exists
    const { data: enrollment, error: getError } = await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        course_id,
        status,
        courses (
          title
        ),
        profiles!enrollments_student_id_fkey (
          full_name,
          email
        )
      `)
      .eq("id", id)
      .single()

    if (getError || !enrollment) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND }
    }

    // 5. Check if there are lesson progress records that need to be handled
    const { data: progressRecords, error: progressError } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("enrollment_id", id)

    if (progressError) {
      console.error("Error checking lesson progress:", progressError)
      return { success: false, error: "Lỗi khi kiểm tra tiến độ học tập" }
    }

    // 6. Delete lesson progress records first (cascade delete)
    if (progressRecords && progressRecords.length > 0) {
      const { error: deleteProgressError } = await supabase
        .from("lesson_progress")
        .delete()
        .eq("enrollment_id", id)

      if (deleteProgressError) {
        console.error("Error deleting lesson progress:", deleteProgressError)
        return { success: false, error: "Lỗi khi xóa tiến độ học tập" }
      }
    }

    // 7. Delete the enrollment
    const { error: deleteError } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete enrollment error:", deleteError)
      return { success: false, error: "Xóa đăng ký thất bại" }
    }

    const studentName = enrollment.profiles?.full_name || enrollment.profiles?.email || "Học viên"
    const courseName = enrollment.courses?.title || "khóa học"

    return { 
      success: true, 
      message: `Đã xóa thành công đăng ký của ${studentName} khỏi khóa học "${courseName}"` 
    }

  } catch (error) {
    console.error("Delete enrollment action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 