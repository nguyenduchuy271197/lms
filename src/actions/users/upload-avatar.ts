"use server"

import { createClient } from "@/lib/supabase/server"
import { AUTH_ERRORS, UPLOAD_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Profile } from "@/types/custom.types"

type Result = 
  | { success: true; data: { profile: Profile; avatarUrl: string } }
  | { success: false; error: string }

export async function uploadAvatar(formData: FormData): Promise<Result> {
  try {
    // 1. Get file from FormData
    const file = formData.get("file") as File
    
    if (!file) {
      return { success: false, error: UPLOAD_ERRORS.FILE_REQUIRED }
    }

    // 2. Validate file type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: UPLOAD_ERRORS.IMAGE_FORMAT_INVALID }
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE }
    }

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED }
    }

    // 5. Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // 6. Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload avatar error:", uploadError)
      return { success: false, error: UPLOAD_ERRORS.AVATAR_UPLOAD_FAILED }
    }

    // 7. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(uploadData.path)

    // 8. Update profile with new avatar URL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("*")
      .single()

    if (profileError) {
      console.error("Update profile with avatar error:", profileError)
      
      // Clean up uploaded file if profile update fails
      await supabase.storage
        .from("user-avatars")
        .remove([uploadData.path])
      
      return { success: false, error: AUTH_ERRORS.PROFILE_UPDATE_FAILED }
    }

    if (!profile) {
      return { success: false, error: AUTH_ERRORS.PROFILE_UPDATE_FAILED }
    }

    return { 
      success: true, 
      data: { 
        profile, 
        avatarUrl: publicUrl 
      } 
    }

  } catch (error) {
    console.error("Upload avatar action error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
} 