"use server"

import { createClient } from "@/lib/supabase/server"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { AUTH_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { redirect } from "next/navigation"
import { z } from "zod"

type Result = 
  | { success: true; data: { user: object; session: object | null } }
  | { success: false; error: string }

export async function registerUser(params: RegisterInput): Promise<Result> {
  try {
    // 1. Validate input
    const { email, password, fullName } = registerSchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      console.error("Register error:", authError)
      
      // Handle specific Supabase auth errors
      if (authError.message.includes("already registered")) {
        return { success: false, error: AUTH_ERRORS.EMAIL_ALREADY_EXISTS }
      }
      
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: AUTH_ERRORS.REGISTRATION_FAILED }
    }

    return { 
      success: true, 
      data: { 
        user: authData.user, 
        session: authData.session 
      } 
    }

  } catch (error) {
    console.error("Register action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
}

// Server action với redirect
export async function registerAndRedirect(params: RegisterInput) {
  const result = await registerUser(params)
  
  if (result.success) {
    redirect("/dashboard")
  }
  
  return result
} 