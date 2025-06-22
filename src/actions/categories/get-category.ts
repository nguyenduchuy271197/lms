"use server"

import { createClient } from "@/lib/supabase/server"
import { getCategorySchema, type GetCategoryInput } from "@/lib/validations/category"
import { CATEGORY_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Category } from "@/types/custom.types"
import { z } from "zod"

type Result = 
  | { success: true; data: Category }
  | { success: false; error: string }

export async function getCategory(params: GetCategoryInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = getCategorySchema.parse(params)

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Get category by id
    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Get category error:", error)
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_NOT_FOUND }
    }

    if (!category) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_NOT_FOUND }
    }

    return { success: true, data: category }

  } catch (error) {
    console.error("Get category action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 