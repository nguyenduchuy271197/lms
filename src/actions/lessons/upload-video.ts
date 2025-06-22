"use server"

import { createClient } from "@/lib/supabase/server"
import { uploadVideoSchema, type UploadVideoInput } from "@/lib/validations/lesson"
import { LESSON_ERRORS, UPLOAD_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Lesson } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Lesson }
  | { success: false; error: string }

export async function uploadVideo(params: UploadVideoInput): Promise<Result> {
  try {
    // 1. Validate input
    const { lessonId, formData } = uploadVideoSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if lesson exists
    const { data: existingLesson, error: checkError } = await supabase
      .from("lessons")
      .select("id, video_url, title")
      .eq("id", lessonId)
      .single()

    if (checkError || !existingLesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND }
    }

    // 5. Get file from FormData
    const file = formData.get("file") as File
    
    if (!file) {
      return { success: false, error: UPLOAD_ERRORS.FILE_REQUIRED }
    }

    // 6. Validate file type and size
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: UPLOAD_ERRORS.VIDEO_FORMAT_INVALID }
    }

    // Max file size: 500MB
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE }
    }

    // 7. Generate unique file name
    const fileExtension = file.name.split('.').pop()
    const fileName = `${lessonId}-${Date.now()}.${fileExtension}`
    const filePath = `lessons/${fileName}`

    try {
      // 8. Upload new video file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error("Video upload error:", uploadError)
        return { success: false, error: UPLOAD_ERRORS.VIDEO_UPLOAD_FAILED }
      }

      // 9. Get public URL for the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('course-videos')
        .getPublicUrl(uploadData.path)

      // 10. Update lesson with new video URL
      const { data: updatedLesson, error: updateError } = await supabase
        .from("lessons")
        .update({
          video_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", lessonId)
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
        console.error("Update lesson video URL error:", updateError)
        
        // Rollback: delete uploaded file
        await supabase.storage
          .from('course-videos')
          .remove([uploadData.path])
        
        return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
      }

      // 11. Clean up old video file if exists
      if (existingLesson.video_url) {
        try {
          const oldUrl = new URL(existingLesson.video_url)
          const pathSegments = oldUrl.pathname.split('/')
          const bucketIndex = pathSegments.findIndex(segment => segment === 'course-videos')
          
          if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
            const oldFilePath = pathSegments.slice(bucketIndex + 1).join('/')
            
            const { error: deleteError } = await supabase.storage
              .from('course-videos')
              .remove([oldFilePath])

            if (deleteError) {
              console.error("Old video cleanup error:", deleteError)
              // Don't fail the operation if cleanup fails
            }
          }
        } catch (cleanupError) {
          console.error("Old video cleanup error:", cleanupError)
          // Don't fail the operation if cleanup fails
        }
      }

      if (!updatedLesson) {
        return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED }
      }

      return { success: true, data: updatedLesson }

    } catch (storageError) {
      console.error("Storage operation error:", storageError)
      return { success: false, error: UPLOAD_ERRORS.VIDEO_UPLOAD_FAILED }
    }

  } catch (error) {
    console.error("Upload video action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 