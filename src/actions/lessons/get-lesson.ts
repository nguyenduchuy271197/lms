"use server"

import { createClient } from "@/lib/supabase/server"
import { getLessonSchema, type GetLessonInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { isAdmin, getCurrentUserId } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson }
  | { success: false; error: string }

export async function getLesson(params: GetLessonInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = getLessonSchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Check if user is admin
    const isUserAdmin = await isAdmin()
    const currentUserId = await getCurrentUserId()

    // 4. Get lesson with course information
    let lessonQuery = supabase
      .from("lessons")
      .select(`
        *,
        courses (
          id,
          title,
          is_published
        )
      `)
      .eq("id", id)

    // If not admin, only show published lessons from published courses
    if (!isUserAdmin) {
      lessonQuery = lessonQuery
        .eq("is_published", true)
        .eq("courses.is_published", true)
    }

    const { data: lesson, error: lessonError } = await lessonQuery.single()

    if (lessonError) {
      console.error("Get lesson error:", lessonError)
      if (lessonError.code === "PGRST116") {
        return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND }
      }
      return { success: false, error: lessonError.message }
    }

    if (!lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND }
    }

    // 5. For non-admin users, check if they are enrolled in the course
    if (!isUserAdmin && currentUserId) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", currentUserId)
        .eq("course_id", lesson.course_id)
        .eq("status", "active")
        .single()

      if (!enrollment) {
        return { success: false, error: LESSON_ERRORS.LESSON_ACCESS_DENIED }
      }
    }

    return { success: true, data: lesson }

  } catch (error) {
    console.error("Get lesson action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 