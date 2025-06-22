"use server"

import { createClient } from "@/lib/supabase/server"
import { publishLessonSchema, type PublishLessonInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson }
  | { success: false; error: string }

export async function publishLesson(params: PublishLessonInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id, is_published } = publishLessonSchema.parse(params)

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

    // 5. If publishing, check if lesson is ready
    if (is_published) {
      const missingFields: string[] = []
      
      if (!existingLesson.title || existingLesson.title.trim() === '') {
        missingFields.push('tiêu đề')
      }
      
      if (!existingLesson.video_url || existingLesson.video_url.trim() === '') {
        missingFields.push('video')
      }
      
      if (existingLesson.duration_seconds === null || existingLesson.duration_seconds <= 0) {
        missingFields.push('thời lượng')
      }

      if (missingFields.length > 0) {
        return { 
          success: false, 
          error: `Bài học chưa sẵn sàng để xuất bản. Thiếu: ${missingFields.join(', ')}` 
        }
      }

      // Check if the course is published (optional requirement)
      const { data: course } = await supabase
        .from("courses")
        .select("is_published")
        .eq("id", existingLesson.course_id)
        .single()

      if (course && !course.is_published) {
        console.warn(`Publishing lesson ${id} in unpublished course ${existingLesson.course_id}`)
      }
    }

    // 6. Update lesson publish status
    const { data: lesson, error: updateError } = await supabase
      .from("lessons")
      .update({
        is_published,
        updated_at: new Date().toISOString()
      })
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
      console.error("Publish lesson error:", updateError)
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
    }

    if (!lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
    }

    return { success: true, data: lesson }

  } catch (error) {
    console.error("Publish lesson action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 