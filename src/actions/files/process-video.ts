"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { processVideoSchema, type ProcessVideoInput } from "@/lib/validations/file-management";
import { LESSON_ERRORS, UPLOAD_ERRORS } from "@/constants/error-messages";

type ProcessingResult = {
  status: 'processing' | 'completed' | 'failed';
  processedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  quality: string;
  message: string;
};

type Result = 
  | { success: true; data: ProcessingResult }
  | { success: false; error: string };

export async function processVideo(params: ProcessVideoInput): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = processVideoSchema.parse(params);
    const { lessonId, videoUrl, quality, generateThumbnail } = validatedData;

    // 2. Check authentication
    const user = await requireAuth();
    
    const supabase = await createClient();

    // 3. Check if user is admin (only admins can process videos)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: UPLOAD_ERRORS.STORAGE_ACCESS_DENIED };
    }

    // 4. Check if lesson exists and video URL matches
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        video_url,
        duration_seconds,
        course_id,
        courses!inner (
          id,
          title
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND };
    }

    // 5. Verify video URL matches
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

    // 7. Check if file exists in storage
    const { data: fileList, error: listError } = await supabase.storage
      .from('course-videos')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });

    if (listError || !fileList || fileList.length === 0) {
      return { success: false, error: "Không tìm thấy file video" };
    }

    // 8. In a real implementation, you would:
    // - Queue the video for processing with a service like AWS MediaConvert, FFmpeg, etc.
    // - Store processing job ID and status in database
    // - Return processing status and poll for completion
    // - Generate different quality versions (720p, 1080p, etc.)
    // - Generate thumbnail images
    // - Update lesson with processed video URLs

    // For this example, we'll simulate processing
    const processingResult: ProcessingResult = {
      status: 'processing',
      quality: quality,
      message: `Video đang được xử lý với chất lượng ${quality}`
    };

    // 9. If generateThumbnail is true, we would also:
    // - Extract frames from video
    // - Generate thumbnail at specific timestamps
    // - Upload thumbnail to course-thumbnails bucket
    // - Return thumbnail URL

    if (generateThumbnail) {
      // Simulate thumbnail generation
      const thumbnailPath = `thumbnails/${lesson.course_id}/${lessonId}-thumb.jpg`;
      processingResult.thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-thumbnails/${thumbnailPath}`;
    }

    // 10. In production, you would update the lesson with processing status
    // and return a job ID that the client can use to poll for completion
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ 
        updated_at: new Date().toISOString()
        // In production, you might add processing_status, job_id fields
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Update lesson error:', updateError);
    }

    // 11. For demo purposes, we'll return a "completed" status
    // In real implementation, this would be returned by a webhook or polling
    processingResult.status = 'completed';
    processingResult.processedUrl = videoUrl; // Would be the new processed URL
    processingResult.duration = lesson.duration_seconds || 0;
    processingResult.message = `Video đã được xử lý thành công với chất lượng ${quality}`;

    return {
      success: true,
      data: processingResult
    };

  } catch (error) {
    console.error('Process video error:', error);
    return { success: false, error: "Xử lý video thất bại" };
  }
} 