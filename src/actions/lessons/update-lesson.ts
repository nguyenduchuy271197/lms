"use server"

import { createClient } from "@/lib/supabase/server"
import { updateLessonSchema, type UpdateLessonInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson }
  | { success: false; error: string }

export async function updateLesson(params: UpdateLessonInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id, title, description, lesson_type, video_url, duration_seconds, order_index, is_published } = updateLessonSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if lesson exists
    const { data: existingLesson, error: checkError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single()

    if (checkError || !existingLesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND }
    }

    // 5. Check if new order_index conflicts with other lessons in the same course
    if (order_index !== undefined && order_index !== existingLesson.order_index) {
      const { data: orderConflict } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", existingLesson.course_id)
        .eq("order_index", order_index)
        .neq("id", id)
        .single()

      if (orderConflict) {
        return { success: false, error: LESSON_ERRORS.LESSON_ORDER_EXISTS }
      }
    }

    // 6. Prepare update data
    const updateData: Partial<Lesson> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (lesson_type !== undefined) updateData.lesson_type = lesson_type
    if (video_url !== undefined) updateData.video_url = video_url
    if (duration_seconds !== undefined) updateData.duration_seconds = duration_seconds
    if (order_index !== undefined) updateData.order_index = order_index
    if (is_published !== undefined) updateData.is_published = is_published

    // 7. Update lesson
    const { data: lesson, error: updateError } = await supabase
      .from("lessons")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        courses (
          id,
          title,
          is_published
        )
      `)
      .single()

    if (updateError) {
      console.error("Update lesson error:", updateError)
      
      // Handle unique constraint violation for order_index
      if (updateError.code === "23505" && updateError.message.includes("order_index")) {
        return { success: false, error: LESSON_ERRORS.LESSON_ORDER_EXISTS }
      }
      
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
    }

    if (!lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
    }

    return { success: true, data: lesson }

  } catch (error) {
    console.error("Update lesson action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 