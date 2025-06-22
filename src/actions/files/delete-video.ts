"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { deleteVideoSchema, type DeleteVideoInput } from "@/lib/validations/file-management";
import { UPLOAD_ERRORS, LESSON_ERRORS } from "@/constants/error-messages";

type Result = 
  | { success: true; data: { message: string } }
  | { success: false; error: string };

export async function deleteVideo(params: DeleteVideoInput): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = deleteVideoSchema.parse(params);
    const { lessonId, videoUrl } = validatedData;

    // 2. Check authentication
    const user = await requireAuth();
    
    const supabase = await createClient();

    // 3. Check if user is admin (only admins can delete videos)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: UPLOAD_ERRORS.STORAGE_ACCESS_DENIED };
    }

    // 4. Get lesson to verify it exists and get video path
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, video_url, course_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND };
    }

    // 5. Verify the video URL matches
    if (lesson.video_url !== videoUrl) {
      return { success: false, error: "URL video không khớp với bài học" };
    }

    // 6. Extract file path from URL
    const urlParts = videoUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'course-videos');
    if (bucketIndex === -1) {
      return { success: false, error: "URL video không hợp lệ" };
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // 7. Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('course-videos')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete video error:', deleteError);
      return { success: false, error: "Không thể xóa video từ storage" };
    }

    // 8. Update lesson to remove video URL
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ 
        video_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Update lesson error:', updateError);
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED };
    }

    return {
      success: true,
      data: {
        message: "Video đã được xóa thành công"
      }
    };

  } catch (error) {
    console.error('Delete video error:', error);
    return { success: false, error: "Xóa video thất bại" };
  }
} 