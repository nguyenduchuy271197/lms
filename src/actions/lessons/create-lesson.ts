"use server"

import { createClient } from "@/lib/supabase/server"
import { createLessonSchema, type CreateLessonInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson }
  | { success: false; error: string }

export async function createLesson(params: CreateLessonInput): Promise<Result> {
  try {
    // 1. Validate input
    const { course_id, title, description, lesson_type, video_url, duration_seconds, order_index, is_published } = createLessonSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", course_id)
      .single()

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // 5. Check if order_index already exists for this course
    const { data: existingLesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", course_id)
      .eq("order_index", order_index)
      .single()

    if (existingLesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_ORDER_EXISTS }
    }

    // 6. Create lesson
    const { data: lesson, error: createError } = await supabase
      .from("lessons")
      .insert({
        course_id,
        title,
        description,
        lesson_type: lesson_type || "video",
        video_url,
        duration_seconds: duration_seconds || 0,
        order_index,
        is_published: is_published || false,
      })
      .select(`
        *,
        courses (
          id,
          title,
          is_published
        )
      `)
      .single()

    if (createError) {
      console.error("Create lesson error:", createError)
      
      // Handle unique constraint violation for order_index
      if (createError.code === "23505" && createError.message.includes("order_index")) {
        return { success: false, error: LESSON_ERRORS.LESSON_ORDER_EXISTS }
      }
      
      return { success: false, error: LESSON_ERRORS.LESSON_CREATE_FAILED }
    }

    if (!lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_CREATE_FAILED }
    }

    return { success: true, data: lesson }

  } catch (error) {
    console.error("Create lesson action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 