"use server"

import { createClient } from "@/lib/supabase/server"
import { createEnrollmentSchema, type CreateEnrollmentInput } from "@/lib/validations/enrollment"
import { ENROLLMENT_ERRORS, COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { EnrollmentWithDetails } from "@/types/custom.types"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: EnrollmentWithDetails }
  | { success: false; error: string }

export async function createEnrollment(params: CreateEnrollmentInput): Promise<Result> {
  try {
    // 1. Validate input
    const { course_id } = createEnrollmentSchema.parse(params)

    // 2. Check authentication and ensure user is a student
    const user = await requireAuth()
    
    // Only students can enroll in courses
    if (user.profile.role !== 'student') {
      return { success: false, error: "Chỉ học viên mới có thể đăng ký khóa học" }
    }

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, is_published")
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    if (!course.is_published) {
      return { success: false, error: "Khóa học chưa được xuất bản" }
    }

    // 5. Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("student_id", user.id)
      .eq("course_id", course_id)
      .single()

    if (existingEnrollment) {
      if (existingEnrollment.status === "active") {
        return { success: false, error: ENROLLMENT_ERRORS.ALREADY_ENROLLED }
      } else if (existingEnrollment.status === "completed") {
        return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_COMPLETED }
      } else if (existingEnrollment.status === "dropped") {
        // Allow re-enrollment if previously dropped
        const { data: updatedEnrollment, error: updateError } = await supabase
          .from("enrollments")
          .update({
            status: "active",
            enrolled_at: new Date().toISOString(),
          })
          .eq("id", existingEnrollment.id)
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
          console.error("Re-enrollment error:", updateError)
          return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_FAILED }
        }

        return { success: true, data: updatedEnrollment }
      }
    }

    // 6. Create new enrollment
    const { data: enrollment, error: createError } = await supabase
      .from("enrollments")
      .insert({
        student_id: user.id,
        course_id,
        status: "active",
        enrolled_at: new Date().toISOString(),
      })
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

    if (createError) {
      console.error("Create enrollment error:", createError)
      
      // Handle unique constraint violation
      if (createError.code === "23505") {
        return { success: false, error: ENROLLMENT_ERRORS.ALREADY_ENROLLED }
      }
      
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_FAILED }
    }

    if (!enrollment) {
      return { success: false, error: ENROLLMENT_ERRORS.ENROLLMENT_FAILED }
    }

    return { success: true, data: enrollment }

  } catch (error) {
    console.error("Create enrollment action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 