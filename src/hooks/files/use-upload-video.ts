"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadVideo } from "@/actions/files/upload-video";
import { type UploadLessonVideoInput } from "@/lib/validations/file-management";
import { toast } from "sonner";

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ params, formData }: { params: UploadLessonVideoInput; formData: FormData }) => {
      const result = await uploadVideo(params, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Video đã được tải lên thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lessons", variables.params.courseId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.params.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["course", variables.params.courseId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải video lên thất bại");
    },
  });
}

// Hook for uploading video with progress tracking
export function useUploadVideoWithProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      params, 
      formData, 
      onProgress 
    }: { 
      params: UploadLessonVideoInput; 
      formData: FormData;
      onProgress?: (progress: number) => void;
    }) => {
      // Note: For actual progress tracking, you'd need to implement
      // a custom upload function that tracks XMLHttpRequest progress
      if (onProgress) {
        onProgress(0);
      }

      const result = await uploadVideo(params, formData);
      
      if (onProgress) {
        onProgress(100);
      }

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Video đã được tải lên thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lessons", variables.params.courseId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.params.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["course", variables.params.courseId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải video lên thất bại");
    },
  });
}

// Hook for batch video upload
export function useBatchUploadVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uploads: Array<{ params: UploadLessonVideoInput; formData: FormData }>) => {
      const results = await Promise.allSettled(
        uploads.map(({ params, formData }) => uploadVideo(params, formData))
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
        toast.success(`Tất cả ${total} video đã được tải lên thành công`);
      } else {
        toast.warning(`${successful.length}/${total} video đã được tải lên thành công`);
      }
      
      // Invalidate all lessons and courses queries
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tải video lên thất bại");
    },
  });
} 