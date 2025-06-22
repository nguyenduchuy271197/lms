"use server"

import { createClient } from "@/lib/supabase/server"
import { deleteCourseSchema, type DeleteCourseInput } from "@/lib/validations/course"
import { COURSE_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: { id: string } }
  | { success: false; error: string }

export async function deleteCourse(params: DeleteCourseInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = deleteCourseSchema.parse(params)

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

    // 5. Check if course has enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", id)
      .limit(1)

    if (enrollmentsError) {
      console.error("Check enrollments error:", enrollmentsError)
      return { success: false, error: getErrorMessage(enrollmentsError) }
    }

    if (enrollments && enrollments.length > 0) {
      return { success: false, error: "Không thể xóa khóa học đã có học viên đăng ký" }
    }

    // 6. Delete course thumbnail from storage if exists
    if (existingCourse.thumbnail_url) {
      try {
        const thumbnailPath = existingCourse.thumbnail_url.split('/').pop()
        if (thumbnailPath) {
          await supabase.storage
            .from("course-thumbnails")
            .remove([`${id}/${thumbnailPath}`])
        }
      } catch (storageError) {
        console.error("Delete thumbnail error:", storageError)
        // Continue with course deletion even if thumbnail deletion fails
      }
    }

    // 7. Delete course (this will cascade delete lessons due to foreign key constraint)
    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete course error:", deleteError)
      return { success: false, error: COURSE_ERRORS.COURSE_DELETE_FAILED }
    }

    return { success: true, data: { id } }

  } catch (error) {
    console.error("Delete course action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 