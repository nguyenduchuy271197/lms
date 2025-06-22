"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { uploadCourseThumbnailSchema, type UploadCourseThumbnailInput } from "@/lib/validations/file-management";
import { UPLOAD_ERRORS, COURSE_ERRORS } from "@/constants/error-messages";

type Result = 
  | { success: true; data: { fileUrl: string; fileName: string; fileSize: number; mimeType: string; bucket: string; path: string } }
  | { success: false; error: string };

export async function uploadThumbnail(
  params: UploadCourseThumbnailInput,
  formData: FormData
): Promise<Result> {
  try {
    // 1. Validate input
    const validatedData = uploadCourseThumbnailSchema.parse(params);
    const { courseId } = validatedData;

    // 2. Check authentication
    const user = await requireAuth();
    
    // 3. Get file from FormData
    const file = formData.get('thumbnail') as File;
    if (!file) {
      return { success: false, error: UPLOAD_ERRORS.FILE_REQUIRED };
    }

    // 4. Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: UPLOAD_ERRORS.IMAGE_FORMAT_INVALID };
    }

    // 5. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE };
    }

    const supabase = await createClient();

    // 6. Check if course exists and user has permission
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, thumbnail_url')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { success: false, error: COURSE_ERRORS.COURSE_NOT_FOUND };
    }

    // 7. Check if user is admin (only admins can upload thumbnails)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { success: false, error: UPLOAD_ERRORS.STORAGE_ACCESS_DENIED };
    }

    // 8. Delete old thumbnail if exists
    if (course.thumbnail_url) {
      const oldUrlParts = course.thumbnail_url.split('/');
      const bucketIndex = oldUrlParts.findIndex(part => part === 'course-thumbnails');
      if (bucketIndex !== -1) {
        const oldFilePath = oldUrlParts.slice(bucketIndex + 1).join('/');
        await supabase.storage
          .from('course-thumbnails')
          .remove([oldFilePath]);
      }
    }

    // 9. Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${courseId}-${Date.now()}.${fileExtension}`;
    const filePath = `courses/${fileName}`;

    // 10. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: UPLOAD_ERRORS.IMAGE_UPLOAD_FAILED };
    }

    // 11. Get public URL
    const { data: urlData } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath);

    // 12. Update course with thumbnail URL
    const { error: updateError } = await supabase
      .from('courses')
      .update({ 
        thumbnail_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    if (updateError) {
      // If course update fails, try to delete the uploaded file
      await supabase.storage
        .from('course-thumbnails')
        .remove([filePath]);
      
      return { success: false, error: COURSE_ERRORS.COURSE_UPDATE_FAILED };
    }

    return {
      success: true,
      data: {
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type,
        bucket: 'course-thumbnails',
        path: filePath
      }
    };

  } catch (error) {
    console.error('Upload thumbnail error:', error);
    return { success: false, error: UPLOAD_ERRORS.IMAGE_UPLOAD_FAILED };
  }
} 