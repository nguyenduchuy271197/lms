"use server"

import { createClient } from "@/lib/supabase/server"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/auth"
import { AUTH_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Profile } from "@/types/custom.types"
import { z } from "zod"

type Result = 
  | { success: true; data: Profile }
  | { success: false; error: string }

export async function updateUserProfile(params: UpdateProfileInput): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = updateProfileSchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED }
    }

    // 4. Update profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("*")
      .single()

    if (profileError) {
      console.error("Update profile error:", profileError)
      return { success: false, error: AUTH_ERRORS.PROFILE_UPDATE_FAILED }
    }

    if (!profile) {
      return { success: false, error: AUTH_ERRORS.PROFILE_UPDATE_FAILED }
    }

    return { success: true, data: profile }

  } catch (error) {
    console.error("Update profile action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 