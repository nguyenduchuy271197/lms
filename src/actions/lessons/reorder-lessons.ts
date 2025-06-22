"use server"

import { createClient } from "@/lib/supabase/server"
import { reorderLessonsSchema, type ReorderLessonsInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson[] }
  | { success: false; error: string }

export async function reorderLessons(params: ReorderLessonsInput): Promise<Result> {
  try {
    // 1. Validate input
    const { course_id, lessons } = reorderLessonsSchema.parse(params)

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

    // 5. Verify all lessons belong to the course
    const lessonIds = lessons.map(l => l.id)
    const { data: existingLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, course_id")
      .in("id", lessonIds)

    if (lessonsError) {
      console.error("Check lessons error:", lessonsError)
      return { success: false, error: lessonsError.message }
    }

    if (!existingLessons || existingLessons.length !== lessons.length) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND }
    }

    // Check if all lessons belong to the specified course
    const invalidLessons = existingLessons.filter(lesson => lesson.course_id !== course_id)
    if (invalidLessons.length > 0) {
      return { success: false, error: "Một số bài học không thuộc khóa học này" }
    }

    // 6. Check for duplicate order indexes
    const orderIndexes = lessons.map(l => l.order_index)
    const uniqueOrderIndexes = new Set(orderIndexes)
    if (orderIndexes.length !== uniqueOrderIndexes.size) {
      return { success: false, error: "Thứ tự bài học không được trùng lặp" }
    }

    // 7. Check for gaps in order sequence (optional validation)
    const sortedIndexes = [...orderIndexes].sort((a, b) => a - b)
    for (let i = 0; i < sortedIndexes.length; i++) {
      if (sortedIndexes[i] !== i + 1) {
        console.warn(`Order index gap detected: expected ${i + 1}, got ${sortedIndexes[i]}`)
      }
    }

    // 8. Perform batch update using transaction
    try {
      // Start transaction by updating all lessons
      const updatePromises = lessons.map(lesson => 
        supabase
          .from("lessons")
          .update({
            order_index: lesson.order_index,
            updated_at: new Date().toISOString()
          })
          .eq("id", lesson.id)
          .eq("course_id", course_id) // Additional safety check
      )

      const results = await Promise.all(updatePromises)
      
      // Check if any update failed
      const failedUpdates = results.filter(result => result.error)
      if (failedUpdates.length > 0) {
        console.error("Reorder lessons errors:", failedUpdates.map(r => r.error))
        return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
      }

      // 9. Fetch updated lessons
      const { data: updatedLessons, error: fetchError } = await supabase
        .from("lessons")
        .select(`
          *,
          courses (
            id,
            title,
            is_published
          )
        `)
        .eq("course_id", course_id)
        .order("order_index", { ascending: true })

      if (fetchError) {
        console.error("Fetch updated lessons error:", fetchError)
        return { success: false, error: fetchError.message }
      }

      return { success: true, data: updatedLessons || [] }

    } catch (transactionError) {
      console.error("Reorder lessons transaction error:", transactionError)
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
    }

  } catch (error) {
    console.error("Reorder lessons action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 