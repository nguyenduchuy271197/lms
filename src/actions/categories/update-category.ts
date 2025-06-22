"use server"

import { createClient } from "@/lib/supabase/server"
import { updateCategorySchema, type UpdateCategoryInput } from "@/lib/validations/category"
import { CATEGORY_ERRORS, getErrorMessage } from "@/constants/error-messages"
import { Category } from "@/types/custom.types"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: Category }
  | { success: false; error: string }

export async function updateCategory(params: UpdateCategoryInput): Promise<Result> {
  try {
    // 1. Validate input
    const { id, name, description, slug } = updateCategorySchema.parse(params)

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

    // 5. Check if new name conflicts with other categories
    if (name && name !== existingCategory.name) {
      const { data: nameConflict } = await supabase
        .from("categories")
        .select("id")
        .eq("name", name)
        .neq("id", id)
        .single()

      if (nameConflict) {
        return { success: false, error: CATEGORY_ERRORS.CATEGORY_NAME_EXISTS }
      }
    }

    // 6. Check if new slug conflicts with other categories
    if (slug && slug !== existingCategory.slug) {
      const { data: slugConflict } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single()

      if (slugConflict) {
        return { success: false, error: CATEGORY_ERRORS.CATEGORY_SLUG_EXISTS }
      }
    }

    // 7. Prepare update data
    const updateData: Partial<Category> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (slug !== undefined) updateData.slug = slug

    // 8. Update category
    const { data: category, error: updateError } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single()

    if (updateError) {
      console.error("Update category error:", updateError)
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_UPDATE_FAILED }
    }

    if (!category) {
      return { success: false, error: CATEGORY_ERRORS.CATEGORY_UPDATE_FAILED }
    }

    return { success: true, data: category }

  } catch (error) {
    console.error("Update category action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 