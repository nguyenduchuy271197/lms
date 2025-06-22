"use server"

import { createClient } from "@/lib/supabase/server"
import { getErrorMessage } from "@/constants/error-messages"
import { redirect } from "next/navigation"

type Result = 
  | { success: true }
  | { success: false; error: string }

export async function logoutUser(): Promise<Result> {
  try {
    // 1. Create Supabase client
    const supabase = await createClient()

    // 2. Sign out user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    console.error("Logout action error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

// Server action với redirect
export async function logoutAndRedirect() {
  await logoutUser()
  
  // Always redirect to login page after logout attempt
  redirect("/auth/login")
} 