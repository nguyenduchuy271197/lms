"use server"

import { createClient } from "@/lib/supabase/server"
import { updateCourseSchema, type UpdateCourseInput } from "@/lib/validations/course"
import { COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Course } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Course }
  | { success: false; error: string }

export async function updateCourse(params: UpdateCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id, title, description, objectives, thumbnail_url, slug, category_id, is_published } = updateCourseSchema.parse(params)

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

    // 5. Check if new slug conflicts with other courses
    if (slug && slug !== existingCourse.slug) {
      const { data: slugConflict } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single()

      if (slugConflict) {
        return { success: false, error: COURSE_ERRORS.COURSE_SLUG_EXISTS }
      }
    }

    // 6. If category_id is provided, check if category exists
    if (category_id && category_id !== existingCourse.category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .single()

      if (!category) {
        return { success: false, error: COURSE_ERRORS.COURSE_CATEGORY_REQUIRED }
      }
    }

    // 7. Prepare update data
    const updateData: Partial<Course> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (objectives !== undefined) updateData.objectives = objectives
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (slug !== undefined) updateData.slug = slug
    if (category_id !== undefined) updateData.category_id = category_id
    if (is_published !== undefined) updateData.is_published = is_published

    // 8. Update course
    const { data: course, error: updateError } = await supabase
      .from("courses")
      .update(updateData)
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
      console.error("Update course error:", updateError)
      return { success: false, error: COURSE_ERRORS.COURSE_UPDATE_FAILED }
    }

    if (!course) {
      return { success: false, error: COURSE_ERRORS.COURSE_UPDATE_FAILED }
    }

    return { success: true, data: course }

  } catch (error) {
    console.error("Update course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 