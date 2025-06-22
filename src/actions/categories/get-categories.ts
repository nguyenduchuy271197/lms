"use server"

import { createClient } from "@/lib/supabase/server"
import { getErrorMessage } from "@/constants/error-messages"
import { Category } from "@/types/custom.types"

type Result = 
  | { success: true; data: Category[] }
  | { success: false; error: string }

export async function getCategories(): Promise<Result> {
  try {
    // 1. Create Supabase client
    const supabase = await createClient()

    // 2. Get all categories ordered by name
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Get categories error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: categories || [] }

  } catch (error) {
    console.error("Get categories action error:", error)
    return { success: false, error: getErrorMessage(error) }
  }
} 