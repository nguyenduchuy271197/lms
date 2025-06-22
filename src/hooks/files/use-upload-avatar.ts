"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar } from "@/actions/files/upload-avatar";
import { type UploadUserAvatarInput } from "@/lib/validations/file-management";
import { toast } from "sonner";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ params, formData }: { params: UploadUserAvatarInput; formData: FormData }) => {
      const result = await uploadAvatar(params, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Avatar đã được tải lên thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["profile", variables.params.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["user", variables.params.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["profiles"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải avatar lên thất bại");
    },
  });
}

// Hook for uploading avatar with preview
export function useUploadAvatarWithPreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      params, 
      formData,
      onPreview 
    }: { 
      params: UploadUserAvatarInput; 
      formData: FormData;
      onPreview?: (previewUrl: string) => void;
    }) => {
      // Generate preview URL for immediate display
      const file = formData.get('avatar') as File;
      if (file && onPreview) {
        const previewUrl = URL.createObjectURL(file);
        onPreview(previewUrl);
      }

      const result = await uploadAvatar(params, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Avatar đã được tải lên thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["profile", variables.params.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["user", variables.params.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["profiles"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải avatar lên thất bại");
    },
  });
}

// Hook for current user avatar upload
export function useUploadMyAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Get current user ID from auth context or query
      const userIdFromAuth = "current-user-id"; // This would come from auth context
      
      const result = await uploadAvatar({ userId: userIdFromAuth }, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Avatar của bạn đã được cập nhật thành công");
      
      // Invalidate current user queries
      queryClient.invalidateQueries({ 
        queryKey: ["profile"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["user"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật avatar thất bại");
    },
  });
}

// Hook for batch avatar upload (admin only)
export function useBatchUploadAvatars() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uploads: Array<{ params: UploadUserAvatarInput; formData: FormData }>) => {
      const results = await Promise.allSettled(
        uploads.map(({ params, formData }) => uploadAvatar(params, formData))
      );

      const successful = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<{ success: true; data: { fileUrl: string; fileName: string; fileSize: number; mimeType: string; bucket: string; path: string } }>).value.data);

      const failed = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      ).length;

      return {
        successful,
        failed,
        total: uploads.length
      };
    },
    onSuccess: (data) => {
      const { successful, failed, total } = data;
      
      if (failed === 0) {
        toast.success(`Tất cả ${total} avatar đã được tải lên thành công`);
      } else {
        toast.warning(`${successful.length}/${total} avatar đã được tải lên thành công`);
      }
      
      // Invalidate all profiles queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải avatar lên thất bại");
    },
  });
}
