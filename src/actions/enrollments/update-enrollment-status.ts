"use server"

import { createClient } from "@/lib/supabase/server"
import { updateEnrollmentStatusSchema, type UpdateEnrollmentStatusInput } from "@/lib/validations/enrollment"
import { ENROLLMENT_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { EnrollmentWithDetails } from "@/types/custom.types"
import { requireAuth, isAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: EnrollmentWithDetails }
  | { success: false; error: string }

export async function updateEnrollmentStatus(params: UpdateEnrollmentStatusInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id, status } = updateEnrollmentStatusSchema.parse(params)

    // 2. Check authentication
    const user = await requireAuth()
    const isUserAdmin = await isAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Get current enrollment
    const { data: currentEnrollment, error: getCurrentError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("id", id)
      .single()

    if (getCurrentError || !currentEnrollment) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND }
    }

    // 5. Check permissions
    // Admin can update any enrollment, students can only update their own and only to "dropped"
    if (!isUserAdmin) {
      if (currentEnrollment.student_id !== user.id) {
        return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_ACCESS_DENIED }
      }
      
      // Students can only drop their enrollment
      if (status !== "dropped") {
        return { success: false, error: "Học viên chỉ có thể hủy đăng ký khóa học" }
      }
    }

    // 6. Validate status transitions
    if (currentEnrollment.status === status) {
      return { success: false, error: `Trạng thái đăng ký đã là ${status}` }
    }

    // Business logic for status transitions
    if (currentEnrollment.status === "completed" && status === "active") {
      return { success: false, error: "Không thể kích hoạt lại khóa học đã hoàn thành" }
    }

    // 7. Update enrollment status
    const updateData: { status: "active" | "completed" | "dropped"; completed_at?: string | null } = { status }
    
    // Set completed_at when marking as completed
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    } else if (status === "active" || status === "dropped") {
      updateData.completed_at = null
    }

    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("enrollments")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          slug,
          is_published,
          categories (
            id,
            name,
            slug
          )
        ),
        profiles!enrollments_student_id_fkey (
          id,
          email,
          full_name,
          avatar_url,
          role
        )
      `)
      .single()

    if (updateError) {
      console.error("Update enrollment status error:", updateError)
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_STATUS_UPDATE_FAILED }
    }

    if (!updatedEnrollment) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_STATUS_UPDATE_FAILED }
    }

    return { success: true, data: updatedEnrollment }

  } catch (error) {
    console.error("Update enrollment status action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 