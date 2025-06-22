"use server"

import { createClient } from "@/lib/supabase/server"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { AUTH_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { z } from "zod"

type Result = 
  | { success: true; data: { user: object; session: object } }
  | { success: false; error: string }

export async function loginUser(params: LoginInput): Promise<Result> {
  try {
    // 1. Validate input
    const { email, password } = loginSchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Login error:", authError)
      
      // Handle specific Supabase auth errors
      if (authError.message.includes("Invalid login credentials")) {
        return { success: false, error: AUTH_ERRORS.INVALID_CREDENTIALS }
      }
      
      if (authError.message.includes("Email not confirmed")) {
        return { success: false, error: "Vui lòng xác thực email trước khi đăng nhập" }
      }
      
      return { success: false, error: authError.message }
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: AUTH_ERRORS.LOGIN_FAILED }
    }

    return { 
      success: true, 
      data: { 
        user: authData.user, 
        session: authData.session 
      } 
    }

  } catch (error) {
    console.error("Login action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
}