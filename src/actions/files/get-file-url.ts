"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { getFileUrlSchema, type GetFileUrlInput } from "@/lib/validations/file-management";
import { AUTH_ERRORS, GENERIC_ERRORS } from "@/constants/error-messages";

export async function getFileUrl(params: GetFileUrlInput) {
  try {
    const validatedData = getFileUrlSchema.parse(params);
    const { bucket, filePath, expiresIn = 3600 } = validatedData;

    const user = await requireAuth();
    const supabase = await createClient();

    // Permission checks based on bucket
    if (bucket === "course-videos") {
      // Check if user is enrolled in the course or is admin
      const pathParts = filePath.split('/');
      if (pathParts.length < 3 || pathParts[0] !== 'lessons') {
        return { success: false, error: "Đường dẫn file không hợp lệ" };
      }

      const courseId = pathParts[1];
      
      if (user.profile.role !== 'admin') {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('status', 'active')
          .single();

        if (!enrollment) {
          return { success: false, error: AUTH_ERRORS.FORBIDDEN };
        }
      }
    } else if (bucket === "user-avatars") {
      // Check if user owns the avatar or is admin
      const userId = filePath.split('/')[0];
      if (user.id !== userId && user.profile.role !== 'admin') {
        return { success: false, error: AUTH_ERRORS.FORBIDDEN };
      }
    } else if (bucket === "course-thumbnails") {
      // Check if user is admin for course thumbnails
      if (user.profile.role !== 'admin') {
        return { success: false, error: AUTH_ERRORS.FORBIDDEN };
      }
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return { success: false, error: "Không thể tạo URL file" };
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        bucket,
        filePath
      }
    };

  } catch (error) {
    console.error('Get file URL error:', error);
    return { success: false, error: GENERIC_ERRORS.SOMETHING_WENT_WRONG };
  }
} 