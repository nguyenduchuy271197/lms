"use server"

import { createClient } from "@/lib/supabase/server"
import { deleteLessonSchema, type DeleteLessonInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: { id: string } }
  | { success: false; error: string }

export async function deleteLesson(params: DeleteLessonInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = deleteLessonSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if lesson exists and get video URL for cleanup
    const { data: existingLesson, error: checkError } = await supabase
      .from("lessons")
      .select("id, video_url")
      .eq("id", id)
      .single()

    if (checkError || !existingLesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND }
    }

    // 5. Check if lesson has progress records (students have started watching)
    const { data: progressRecords, error: progressError } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("lesson_id", id)
      .limit(1)

    if (progressError) {
      console.error("Check lesson progress error:", progressError)
      return { success: false, error: progressError.message }
    }

    // If there are progress records, we might want to warn or prevent deletion
    // For now, we'll allow deletion but this could be configurable
    if (progressRecords && progressRecords.length > 0) {
      console.warn(`Deleting lesson ${id} that has progress records`)
    }

    // 6. Delete video file from storage if exists
    if (existingLesson.video_url) {
      try {
        // Extract file path from URL
        const url = new URL(existingLesson.video_url)
        const pathSegments = url.pathname.split('/')
        const bucketIndex = pathSegments.findIndex(segment => segment === 'course-videos')
        
        if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
          const filePath = pathSegments.slice(bucketIndex + 1).join('/')
          
          const { error: storageError } = await supabase.storage
            .from('course-videos')
            .remove([filePath])

          if (storageError) {
            console.error("Storage cleanup error:", storageError)
            // Don't fail the deletion if storage cleanup fails
          }
        }
      } catch (storageError) {
        console.error("Storage cleanup error:", storageError)
        // Don't fail the deletion if storage cleanup fails
      }
    }

    // 7. Delete lesson (this will cascade delete lesson_progress due to foreign key)
    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete lesson error:", deleteError)
      return { success: false, error: LESSON_ERRORS.LESSON_DELETE_FAILED }
    }

    return { success: true, data: { id } }

  } catch (error) {
    console.error("Delete lesson action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 