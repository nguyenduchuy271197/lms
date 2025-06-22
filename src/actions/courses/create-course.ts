"use server"

import { createClient } from "@/lib/supabase/server"
import { createCourseSchema, type CreateCourseInput } from "@/lib/validations/course"
import { COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Course } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Course }
  | { success: false; error: string }

export async function createCourse(params: CreateCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { title, description, objectives, thumbnail_url, slug, category_id, is_published } = createCourseSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if course slug already exists
    const { data: existingBySlug } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existingBySlug) {
      return { success: false, error: COURSE_ERRORS.COURSE_SLUG_EXISTS }
    }

    // 5. If category_id is provided, check if category exists
    if (category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .single()

      if (!category) {
        return { success: false, error: COURSE_ERRORS.COURSE_CATEGORY_REQUIRED }
      }
    }

    // 6. Create course
    const { data: course, error: createError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        objectives,
        thumbnail_url,
        slug,
        category_id,
        is_published: is_published || false,
      })
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .single()

    if (createError) {
      console.error("Create course error:", createError)
      return { success: false, error: COURSE_ERRORS.COURSE_CREATE_FAILED }
    }

    if (!course) {
      return { success: false, error: COURSE_ERRORS.COURSE_CREATE_FAILED }
    }

    return { success: true, data: course }

  } catch (error) {
    console.error("Create course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 