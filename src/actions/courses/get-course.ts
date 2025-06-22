"use server"

import { createClient } from "@/lib/supabase/server"
import { getCourseSchema, type GetCourseInput } from "@/lib/validations/course"
import { COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Course } from "@/types/custom.types"
import { isAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Course }
  | { success: false; error: string }

export async function getCourse(params: GetCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = getCourseSchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Check if user is admin
    const isUserAdmin = await isAdmin()

    // 4. Build query based on user role
    let query = supabase
      .from("courses")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("id", id)

    // If not admin, only show published courses
    if (!isUserAdmin) {
      query = query.eq("is_published", true)
    }

    const { data: course, error } = await query.single()

    if (error) {
      console.error("Get course error:", error)
      if (error.code === "PGRST116") {
        return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
      }
      return { success: false, error: error.message }
    }

    if (!course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    return { success: true, data: course }

  } catch (error) {
    console.error("Get course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 