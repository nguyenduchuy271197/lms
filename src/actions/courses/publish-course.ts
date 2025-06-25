"use server"

import { createClient } from "@/lib/supabase/server"
import { publishCourseSchema, type PublishCourseInput } from "@/lib/validations/course"
import { COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Course } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Course }
  | { success: false; error: string }

export async function publishCourse(params: PublishCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id, is_published } = publishCourseSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if course exists
    const { data: existingCourse, error: checkError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single()

    if (checkError || !existingCourse) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // 5. If publishing, check if course is ready
    if (is_published) {
      // Check if course has required fields
      if (!existingCourse.title || !existingCourse.description) {
        return { success: false, error: COURSE_ERRORS.COURSE_NOT_READY }
      }
    }

    // 6. Update course publication status
    const { data: course, error: updateError } = await supabase
      .from("courses")
      .update({ 
        is_published,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .single()

    if (updateError) {
      console.error("Publish course error:", updateError)
      if (is_published) {
        return { success: false, error: COURSE_ERRORS.COURSE_PUBLISH_FAILED }
      } else {
        return { success: false, error: COURSE_ERRORS.COURSE_UNPUBLISH_FAILED }
      }
    }

    if (!course) {
      if (is_published) {
        return { success: false, error: COURSE_ERRORS.COURSE_PUBLISH_FAILED }
      } else {
        return { success: false, error: COURSE_ERRORS.COURSE_UNPUBLISH_FAILED }
      }
    }

    return { success: true, data: course }

  } catch (error) {
    console.error("Publish course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 