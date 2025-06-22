"use server"

import { createClient } from "@/lib/supabase/server"
import { getEnrollmentSchema, type GetEnrollmentInput } from "@/lib/validations/enrollment"
import { ENROLLMENT_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { EnrollmentWithDetails } from "@/types/custom.types"
import { requireAuth, isAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: EnrollmentWithDetails }
  | { success: false; error: string }

export async function getEnrollment(params: GetEnrollmentInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = getEnrollmentSchema.parse(params)

    // 2. Check authentication and get current user
    const user = await requireAuth()
    const isUserAdmin = await isAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Get enrollment with course and student information
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
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
      .eq("id", id)
      .single()

    if (enrollmentError) {
      console.error("Get enrollment error:", enrollmentError)
      if (enrollmentError.code === "PGRST116") {
        return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND }
      }
      return { success: false, error: enrollmentError.message }
    }

    if (!enrollment) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_NOT_FOUND }
    }

    // 5. Check access permissions
    // Admin can view any enrollment, students can only view their own
    if (!isUserAdmin && enrollment.student_id !== user.id) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_ACCESS_DENIED }
    }

    return { success: true, data: enrollment }

  } catch (error) {
    console.error("Get enrollment action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 