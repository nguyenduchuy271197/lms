"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { getVideoMetadataSchema, type GetVideoMetadataInput } from "@/lib/validations/file-management";
import { LESSON_ERRORS } from "@/constants/error-messages";

type VideoMetadata = {
  duration: number;
  width: number;
  height: number;
  fileSize: number;
  format: string;
  bitrate?: number;
  fps?: number;
  hasAudio: boolean;
  thumbnailUrl?: string;
};

type Result = 
  | { success: true; data: VideoMetadata }
  | { success: false; error: string };

export async function getVideoMetadata(params: GetVideoMetadataInput): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = getVideoMetadataSchema.parse(params);
    const { lessonId, videoUrl } = validatedData;

    // 2. Check authentication
    const user = await requireAuth();
    
    const supabase = await createClient();

    // 3. Check if lesson exists and user has access
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        video_url,
        duration_seconds,
        course_id,
        courses!inner (
          id,
          title,
          is_published
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND };
    }

    // 4. Verify video URL matches
    if (lesson.video_url !== videoUrl) {
      return { success: false, error: "URL video không khớp với bài học" };
    }

    // 5. Check if user has permission to access video metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      // Check if user is enrolled in the course
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', lesson.course_id)
        .in('status', ['active', 'completed'])
        .single();

      if (!enrollment) {
        return { success: false, error: "Bạn không có quyền truy cập metadata video này" };
      }
    }

    // 6. Extract file path from URL to get file info
    const urlParts = videoUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'course-videos');
    if (bucketIndex === -1) {
      return { success: false, error: "URL video không hợp lệ" };
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // 7. Get file info from storage
    const { data: fileInfo, error: fileError } = await supabase.storage
      .from('course-videos')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });

    if (fileError || !fileInfo || fileInfo.length === 0) {
      return { success: false, error: "Không tìm thấy thông tin file video" };
    }

    const file = fileInfo[0];

    // 8. For this example, we'll return basic metadata
    // In a real implementation, you might use a video processing service
    // like FFmpeg or a cloud service to extract detailed metadata
    const metadata: VideoMetadata = {
      duration: lesson.duration_seconds || 0,
      width: 1920, // Default values - would be extracted from actual video
      height: 1080,
      fileSize: file.metadata?.size || 0,
      format: file.name?.split('.').pop()?.toLowerCase() || 'mp4',
      bitrate: undefined, // Would be extracted from video
      fps: undefined, // Would be extracted from video
      hasAudio: true, // Would be detected from video
      thumbnailUrl: undefined // Would be generated or extracted
    };

    // 9. In a production environment, you would:
    // - Use a video processing service to extract actual metadata
    // - Cache the results to avoid repeated processing
    // - Generate thumbnails if needed
    // - Store metadata in the database for faster access

    return {
      success: true,
      data: metadata
    };

  } catch (error) {
    console.error('Get video metadata error:', error);
    return { success: false, error: "Lấy metadata video thất bại" };
  }
} 