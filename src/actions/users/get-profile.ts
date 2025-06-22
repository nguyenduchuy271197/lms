"use server"

import { createClient } from "@/lib/supabase/server"
import { AUTH_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Profile } from "@/types/custom.types"

type Result = 
  | { success: true; data: Profile }
  | { success: false; error: string }

export async function getUserProfile(): Promise<Result> {
  try {
    // 1. Create Supabase client
    const supabase = await createClient()

    // 2. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: AUTH_ERRORS.UNAUTHORIZED }
    }

    // 3. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Get profile error:", profileError)
      return { success: false, error: AUTH_ERRORS.PROFILE_NOT_FOUND }
    }

    if (!profile) {
      return { success: false, error: AUTH_ERRORS.PROFILE_NOT_FOUND }
    }

    return { success: true, data: profile }

  } catch (error) {
    console.error("Get profile action error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
} 