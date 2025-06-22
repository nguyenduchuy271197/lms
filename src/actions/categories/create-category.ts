"use server"

import { createClient } from "@/lib/supabase/server"
import { createCategorySchema, type CreateCategoryInput } from "@/lib/validations/category"
import { CATEGORY_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Category } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Category }
  | { success: false; error: string }

export async function createCategory(params: CreateCategoryInput): Promise<Result> {
  try {
    // 1. Validate input
    const { name, description, slug } = createCategorySchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if category name already exists
    const { data: existingByName } = await supabase
      .from("categories")
      .select("id")
      .eq("name", name)
      .single()

    if (existingByName) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_NAME_EXISTS }
    }

    // 5. Check if category slug already exists
    const { data: existingBySlug } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existingBySlug) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_SLUG_EXISTS }
    }

    // 6. Create category
    const { data: category, error: createError } = await supabase
      .from("categories")
      .insert({
        name,
        description,
        slug,
      })
      .select("*")
      .single()

    if (createError) {
      console.error("Create category error:", createError)
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_CREATE_FAILED }
    }

    if (!category) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_CREATE_FAILED }
    }

    return { success: true, data: category }

  } catch (error) {
    console.error("Create category action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 