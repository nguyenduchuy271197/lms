"use server"

import { createClient } from "@/lib/supabase/server"
import { changeRoleSchema, type ChangeRoleInput } from "@/lib/validations/auth"
import { AUTH_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Profile } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Profile }
  | { success: false; error: string }

export async function changeUserRole(params: ChangeRoleInput): Promise<Result> {
  try {
    // 1. Validate input
    const { userId, role } = changeRoleSchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if target user exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (checkError || !existingProfile) {
      return { success: false, error: AUTH_ERRORS.PROFILE_NOT_FOUND }
    }

    // 5. Update user role
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single()

    if (updateError) {
      console.error("Change role error:", updateError)
      return { success: false, error: "Cập nhật vai trò thất bại" }
    }

    if (!profile) {
      return { success: false, error: "Cập nhật vai trò thất bại" }
    }

    return { success: true, data: profile }

  } catch (error) {
    console.error("Change role action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 