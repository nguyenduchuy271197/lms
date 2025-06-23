"use server"

import { createClient } from "@/lib/supabase/server"
import { uploadThumbnailSchema, type UploadThumbnailInput } from "@/lib/validations/course"
import { COURSE_ERRORS, UPLOAD_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: { thumbnail_url: string } }
  | { success: false; error: string }

export async function uploadThumbnail(params: UploadThumbnailInput): Promise<Result> {
  try {
    // 1. Validate input
    const { courseId, formData } = uploadThumbnailSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if course exists
    const { data: existingCourse, error: checkError } = await supabase
      .from("courses")
      .select("id, thumbnail_url")
      .eq("id", courseId)
      .single()

    if (checkError || !existingCourse) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND }
    }

    // 5. Get file from FormData
    const file = formData.get("thumbnail") as File
    if (!file) {
      return { success: false, error: UPLOAD_ERRORS.FILE_REQUIRED }
    }

    // 6. Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: UPLOAD_ERRORS.IMAGE_FORMAT_INVALID }
    }

    // 7. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE }
    }

    // 8. Delete old thumbnail if exists
    if (existingCourse.thumbnail_url) {
      try {
        const oldUrlParts = existingCourse.thumbnail_url.split('/')
        const bucketIndex = oldUrlParts.findIndex(part => part === 'course-thumbnails')
        if (bucketIndex !== -1) {
          const oldFilePath = oldUrlParts.slice(bucketIndex + 1).join('/')
          await supabase.storage
            .from("course-thumbnails")
            .remove([oldFilePath])
        }
      } catch (deleteError) {
        console.error("Delete old thumbnail error:", deleteError)
        // Continue with upload even if old file deletion fails
      }
    }

    // 9. Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${courseId}-${Date.now()}.${fileExtension}`
    const filePath = `courses/${fileName}`

    // 10. Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("course-thumbnails")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload thumbnail error:", uploadError)
      return { success: false, error: UPLOAD_ERRORS.IMAGE_UPLOAD_FAILED }
    }

    // 11. Get public URL
    const { data: urlData } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(uploadData.path)

    const thumbnail_url = urlData.publicUrl

    // 12. Update course with new thumbnail URL
    const { error: updateError } = await supabase
      .from("courses")
      .update({ 
        thumbnail_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", courseId)

    if (updateError) {
      console.error("Update course thumbnail URL error:", updateError)
      
      // Try to delete uploaded file if database update fails
      try {
        await supabase.storage
          .from("course-thumbnails")
          .remove([filePath])
      } catch (cleanupError) {
        console.error("Cleanup uploaded file error:", cleanupError)
      }
      
      return { success: false, error: COURSE_ERRORS.COURSE_UPDATE_FAILED }
    }

    return { success: true, data: { thumbnail_url } }

  } catch (error) {
    console.error("Upload thumbnail action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 