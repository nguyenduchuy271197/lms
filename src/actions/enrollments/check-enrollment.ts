"use server"

import { createClient } from "@/lib/supabase/server"
import { checkEnrollmentSchema, type CheckEnrollmentInput } from "@/lib/validations/enrollment"
import { ENROLLMENT_ERRORS, COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { requireAuth, isAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: { isEnrolled: boolean; status?: string; enrollmentId?: string } }
  | { success: false; error: string }

export async function checkEnrollment(params: CheckEnrollmentInput): Promise<Result> {
  try {
    // 1. Validate input
    const { course_id, student_id } = checkEnrollmentSchema.parse(params)

    // 2. Check authentication
    const user = await requireAuth()
    const isUserAdmin = await isAdmin()

    // 3. Determine which student to check
    const targetStudentId = student_id || user.id

    // 4. Permission check: non-admin users can only check their own enrollment
    if (!isUserAdmin && targetStudentId !== user.id) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_ACCESS_DENIED }
    }

    // 5. Create Supabase client
    const supabase = await createClient()

    // 6. Check if course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, is_published")
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // 7. Check enrollment status
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("student_id", targetStudentId)
      .eq("course_id", course_id)
      .single()

    if (enrollmentError) {
      // No enrollment found
      if (enrollmentError.code === "PGRST116") {
        return { 
          success: true, 
          data: { isEnrolled: false } 
        }
      }
      
      console.error("Check enrollment error:", enrollmentError)
      return { success: false, error: enrollmentError.message }
    }

    // 8. Return enrollment status
    return { 
      success: true, 
      data: { 
        isEnrolled: true, 
        status: enrollment.status,
        enrollmentId: enrollment.id
      } 
    }

  } catch (error) {
    console.error("Check enrollment action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 