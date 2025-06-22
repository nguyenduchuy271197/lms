"use server"

import { createClient } from "@/lib/supabase/server"
import { getEnrollmentsByCourseSchema, type GetEnrollmentsByCourseInput } from "@/lib/validations/enrollment"
import { COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { EnrollmentWithDetails } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: EnrollmentWithDetails[] }
  | { success: false; error: string }

export async function getEnrollmentsByCourse(params: GetEnrollmentsByCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { course_id } = getEnrollmentsByCourseSchema.parse(params)

    // 2. Check admin permission (only admins can view course enrollments)
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // 5. Get enrollments for the course
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        *,
        profiles!enrollments_student_id_fkey (
          id,
          email,
          full_name,
          avatar_url,
          role
        ),
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
        )
      `)
      .eq("course_id", course_id)
      .order("enrolled_at", { ascending: false })

    if (enrollmentsError) {
      console.error("Get enrollments by course error:", enrollmentsError)
      return { success: false, error: enrollmentsError.message }
    }

    return { success: true, data: enrollments || [] }

  } catch (error) {
    console.error("Get enrollments by course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 