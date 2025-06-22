"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { uploadLessonVideoSchema, type UploadLessonVideoInput } from "@/lib/validations/file-management";
import { UPLOAD_ERRORS, LESSON_ERRORS } from "@/constants/error-messages";

type Result = 
  | { success: true; data: { fileUrl: string; fileName: string; fileSize: number; mimeType: string; bucket: string; path: string } }
  | { success: false; error: string };

export async function uploadVideo(
  params: UploadLessonVideoInput,
  formData: FormData
): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = uploadLessonVideoSchema.parse(params);
    const { courseId, lessonId } = validatedData;

    // 2. Check authentication
    const user = await requireAuth();
    
    // 3. Get file from FormData
    const file = formData.get('video') as File;
    if (!file) {
      return { success: false, error: UPLOAD_ERRORS.FILE_REQUIRED };
    }

    // 4. Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: UPLOAD_ERRORS.VIDEO_FORMAT_INVALID };
    }

    // 5. Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return { success: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE };
    }

    const supabase = await createClient();

    // 6. Check if user has permission to upload video for this lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        course_id,
        courses!inner (
          id,
          title
        )
      `)
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single();

    if (lessonError || !lesson) {
      return { success: false, error: LESSON_ERRORS.LESSON_NOT_FOUND };
    }

    // 7. Check if user is admin (only admins can upload videos)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: UPLOAD_ERRORS.STORAGE_ACCESS_DENIED };
    }

    // 8. Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${lessonId}-${Date.now()}.${fileExtension}`;
    const filePath = `lessons/${courseId}/${fileName}`;

    // 9. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('course-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: UPLOAD_ERRORS.VIDEO_UPLOAD_FAILED };
    }

    // 10. Get public URL
    const { data: urlData } = supabase.storage
      .from('course-videos')
      .getPublicUrl(filePath);

    // 11. Update lesson with video URL
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ 
        video_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId);

    if (updateError) {
      // If lesson update fails, try to delete the uploaded file
      await supabase.storage
        .from('course-videos')
        .remove([filePath]);
      
      return { success: false, error: LESSON_ERRORS.LESSON_UPDATE_FAILED };
    }

    return {
      success: true,
      data: {
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type,
        bucket: 'course-videos',
        path: filePath
      }
    };

  } catch (error) {
    console.error('Upload video error:', error);
    return { success: false, error: UPLOAD_ERRORS.VIDEO_UPLOAD_FAILED };
  }
} 