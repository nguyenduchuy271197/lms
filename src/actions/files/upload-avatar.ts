"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { uploadUserAvatarSchema, type UploadUserAvatarInput } from "@/lib/validations/file-management";
import { UPLOAD_ERRORS, AUTH_ERRORS } from "@/constants/error-messages";

export async function uploadAvatar(
  params: UploadUserAvatarInput,
  formData: FormData
) {
  try {
    const validatedData = uploadUserAvatarSchema.parse(params);
    const { userId } = validatedData;

    const user = await requireAuth();
    
    if (user.id !== userId && user.profile.role !== 'admin') {
      return { success: false, error: AUTH_ERRORS.FORBIDDEN };
    }

    const file = formData.get('avatar') as File;
    if (!file) {
      return { success: false, error: UPLOAD_ERRORS.FILE_REQUIRED };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: UPLOAD_ERRORS.IMAGE_FORMAT_INVALID };
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: UPLOAD_ERRORS.FILE_TOO_LARGE };
    }

    const supabase = await createClient();

    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return { success: false, error: AUTH_ERRORS.PROFILE_NOT_FOUND };
    }

    if (targetUser.avatar_url) {
      const oldUrlParts = targetUser.avatar_url.split('/');
      const bucketIndex = oldUrlParts.findIndex(part => part === 'user-avatars');
      if (bucketIndex !== -1) {
        const oldFilePath = oldUrlParts.slice(bucketIndex + 1).join('/');
        await supabase.storage
          .from('user-avatars')
          .remove([oldFilePath]);
      }
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar-${Date.now()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: UPLOAD_ERRORS.AVATAR_UPLOAD_FAILED };
    }

    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      await supabase.storage
        .from('user-avatars')
        .remove([filePath]);
      
      return { success: false, error: AUTH_ERRORS.PROFILE_UPDATE_FAILED };
    }

    return {
      success: true,
      data: {
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type,
        bucket: 'user-avatars',
        path: filePath
      }
    };

  } catch (error) {
    console.error('Upload avatar error:', error);
    return { success: false, error: UPLOAD_ERRORS.AVATAR_UPLOAD_FAILED };
  }
} 