"use server"

import { createClient } from "@/lib/supabase/server"
import { getMyEnrollmentsSchema, type GetMyEnrollmentsInput } from "@/lib/validations/enrollment"
import { getErrorMessage } from "@/constants/error-messages"
import { EnrollmentWithDetails } from "@/types/custom.types"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

type Result = 
  | { success: true; data: EnrollmentWithDetails[] }
  | { success: false; error: string }

export async function getMyEnrollments(params: GetMyEnrollmentsInput = {}): Promise<Result> {
  try {
    // 1. Validate input
    const { status } = getMyEnrollmentsSchema.parse(params)

    // 2. Check authentication and get current user
    const user = await requireAuth()

    // 3. Create Supabase client
    const supabase = await createClient()

    // 4. Build query for user's enrollments
    let enrollmentsQuery = supabase
      .from("enrollments")
      .select(`
        *,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          slug,
          is_published,
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false })

    // Filter by status if provided
    if (status) {
      enrollmentsQuery = enrollmentsQuery.eq("status", status)
    }

    const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery

    if (enrollmentsError) {
      console.error("Get my enrollments error:", enrollmentsError)
      return { success: false, error: enrollmentsError.message }
    }

    return { success: true, data: enrollments || [] }

  } catch (error) {
    console.error("Get my enrollments action error:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    return { success: false, error: getErrorMessage(error) }
  }
} 