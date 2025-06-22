"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { deleteThumbnailSchema, type DeleteThumbnailInput } from "@/lib/validations/file-management";
import { UPLOAD_ERRORS, COURSE_ERRORS } from "@/constants/error-messages";

type Result = 
  | { success: true; data: { message: string } }
  | { success: false; error: string };

export async function deleteThumbnail(params: DeleteThumbnailInput): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = deleteThumbnailSchema.parse(params);
    const { courseId, thumbnailUrl } = validatedData;

    // 2. Check authentication
    const user = await requireAuth();
    
    const supabase = await createClient();

    // 3. Check if user is admin (only admins can delete thumbnails)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: UPLOAD_ERRORS.STORAGE_ACCESS_DENIED };
    }

    // 4. Get course to verify it exists and thumbnail URL matches
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, thumbnail_url')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND };
    }

    // 5. Verify the thumbnail URL matches
    if (course.thumbnail_url !== thumbnailUrl) {
      return { success: false, error: "URL thumbnail không khớp với khóa học" };
    }

    // 6. Extract file path from URL
    const urlParts = thumbnailUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'course-thumbnails');
    if (bucketIndex === -1) {
      return { success: false, error: "URL thumbnail không hợp lệ" };
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // 7. Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('course-thumbnails')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete thumbnail error:', deleteError);
      return { success: false, error: "Không thể xóa thumbnail từ storage" };
    }

    // 8. Update course to remove thumbnail URL
    const { error: updateError } = await supabase
      .from('courses')
      .update({ 
        thumbnail_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    if (updateError) {
      console.error('Update course error:', updateError);
      return { success: false, error: COURSE_ERRORS.COURSE_UPDATE_FAILED };
    }

    return {
      success: true,
      data: {
        message: "Thumbnail đã được xóa thành công"
      }
    };

  } catch (error) {
    console.error('Delete thumbnail error:', error);
    return { success: false, error: "Xóa thumbnail thất bại" };
  }
} 