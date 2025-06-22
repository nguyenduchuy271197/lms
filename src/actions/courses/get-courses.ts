"use server"

import { createClient } from "@/lib/supabase/server"
import { getErrorMessage } from "@/constants/error-messages"
import { Course } from "@/types/custom.types"
import { isAdmin } from "@/lib/auth"

type Result = 
  | { success: true; data: Course[] }
  | { success: false; error: string }

export async function getCourses(): Promise<Result> {
  try {
    // 1. Create Supabase client
    const supabase = await createClient()

    // 2. Check if user is admin to see all courses or only published ones
    const isUserAdmin = await isAdmin()

    // 3. Build query based on user role
    let query = supabase
      .from("courses")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false })

    // If not admin, only show published courses
    if (!isUserAdmin) {
      query = query.eq("is_published", true)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error("Get courses error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: courses || [] }

  } catch (error) {
    console.error("Get courses action error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
} 