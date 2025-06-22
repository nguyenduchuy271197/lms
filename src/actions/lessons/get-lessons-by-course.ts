"use server"

import { createClient } from "@/lib/supabase/server"
import { getLessonsByCourseSchema, type GetLessonsByCourseInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { isAdmin, getCurrentUserId } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson[] }
  | { success: false; error: string }

export async function getLessonsByCourse(params: GetLessonsByCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { course_id } = getLessonsByCourseSchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Check if user is admin
    const isUserAdmin = await isAdmin()
    const currentUserId = await getCurrentUserId()

    // 4. Check if course exists and user has access
    let courseQuery = supabase
      .from("courses")
      .select("id, is_published")
      .eq("id", course_id)

    // If not admin, only check published courses
    if (!isUserAdmin) {
      courseQuery = courseQuery.eq("is_published", true)
    }

    const { data: course, error: courseError } = await courseQuery.single()

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // 5. For non-admin users, check if they are enrolled in the course
    if (!isUserAdmin && currentUserId) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", currentUserId)
        .eq("course_id", course_id)
        .eq("status", "active")
        .single()

      if (!enrollment) {
        return { success: false, error: LESSON_ERRORS.LESSON_ACCESS_DENIED }
      }
    }

    // 6. Build lessons query based on user role
    let lessonsQuery = supabase
      .from("lessons")
      .select("*")
      .eq("course_id", course_id)
      .order("order_index", { ascending: true })

    // If not admin, only show published lessons
    if (!isUserAdmin) {
      lessonsQuery = lessonsQuery.eq("is_published", true)
    }

    const { data: lessons, error: lessonsError } = await lessonsQuery

    if (lessonsError) {
      console.error("Get lessons by course error:", lessonsError)
      return { success: false, error: lessonsError.message }
    }

    return { success: true, data: lessons || [] }

  } catch (error) {
    console.error("Get lessons by course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 