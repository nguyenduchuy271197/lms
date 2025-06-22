"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadThumbnail } from "@/actions/files/upload-thumbnail";
import { type UploadCourseThumbnailInput } from "@/lib/validations/file-management";
import { toast } from "sonner";

export function useUploadThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ params, formData }: { params: UploadCourseThumbnailInput; formData: FormData }) => {
      const result = await uploadThumbnail(params, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Thumbnail đã được tải lên thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["course", variables.params.courseId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["courses"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải thumbnail lên thất bại");
    },
  });
}

// Hook for uploading thumbnail with preview
export function useUploadThumbnailWithPreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      params, 
      formData,
      onPreview 
    }: { 
      params: UploadCourseThumbnailInput; 
      formData: FormData;
      onPreview?: (previewUrl: string) => void;
    }) => {
      // Generate preview URL for immediate display
      const file = formData.get('thumbnail') as File;
      if (file && onPreview) {
        const previewUrl = URL.createObjectURL(file);
        onPreview(previewUrl);
      }

      const result = await uploadThumbnail(params, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Thumbnail đã được tải lên thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["course", variables.params.courseId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["courses"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải thumbnail lên thất bại");
    },
  });
}

// Hook for batch thumbnail upload
export function useBatchUploadThumbnails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uploads: Array<{ params: UploadCourseThumbnailInput; formData: FormData }>) => {
      const results = await Promise.allSettled(
        uploads.map(({ params, formData }) => uploadThumbnail(params, formData))
      );

      const successful = results.filter((result): result is PromiseFulfilledResult<{ success: true; data: { fileUrl: string; fileName: string; fileSize: number; mimeType: string; bucket: string; path: string } }> => 
        result.status === 'fulfilled' && result.value.success
      );

      const failed = results.filter((result): result is PromiseRejectedResult => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      return {
        successful: successful.map(result => result.value.data),
        failed: failed.length,
        total: uploads.length
      };
    },
    onSuccess: (data) => {
      const { successful, failed, total } = data;
      
      if (failed === 0) {
        toast.success(`Tất cả ${total} thumbnail đã được tải lên thành công`);
      } else {
        toast.warning(`${successful.length}/${total} thumbnail đã được tải lên thành công`);
      }
      
      // Invalidate all courses queries
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải thumbnail lên thất bại");
    },
  });
} 