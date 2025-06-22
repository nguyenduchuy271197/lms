"use server"

import { createClient } from "@/lib/supabase/server"
import { deleteCategorySchema, type DeleteCategoryInput } from "@/lib/validations/category"
import { CATEGORY_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: { id: string } }
  | { success: false; error: string }

export async function deleteCategory(params: DeleteCategoryInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id } = deleteCategorySchema.parse(params)

    // 2. Check admin permission
    await requireAdmin()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single()

    if (checkError || !existingCategory) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_NOT_FOUND }
    }

    // 5. Check if category has courses
    const { data: coursesInCategory, error: coursesError } = await supabase
      .from("courses")
      .select("id")
      .eq("category_id", id)
      .limit(1)

    if (coursesError) {
      console.error("Check courses in category error:", coursesError)
      return { success: false, error: getErrorMessage(coursesError) }
    }

    if (coursesInCategory && coursesInCategory.length > 0) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_HAS_COURSES }
    }

    // 6. Delete category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete category error:", deleteError)
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_DELETE_FAILED }
    }

    return { success: true, data: { id } }

  } catch (error) {
    console.error("Delete category action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 