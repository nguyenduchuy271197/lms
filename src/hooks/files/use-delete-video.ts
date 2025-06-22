"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVideo } from "@/actions/files/delete-video";
import { type DeleteVideoInput } from "@/lib/validations/file-management";
import { toast } from "sonner";

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteVideoInput) => {
      const result = await deleteVideo(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Video đã được xóa thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["lessons"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa video thất bại");
    },
  });
}

// Hook for batch video deletion
export function useBatchDeleteVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videos: DeleteVideoInput[]) => {
      const results = await Promise.allSettled(
        videos.map(video => deleteVideo(video))
      );

      const successful = results.filter((result): result is PromiseFulfilledResult<{ success: true; data: { message: string } }> => 
        result.status === 'fulfilled' && result.value.success
      );

      const failed = results.filter((result): result is PromiseRejectedResult => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      return {
        successful: successful.length,
        failed: failed.length,
        total: videos.length
      };
    },
    onSuccess: (data) => {
      const { successful, failed, total } = data;
      
      if (failed === 0) {
        toast.success(`Tất cả ${total} video đã được xóa thành công`);
      } else {
        toast.warning(`${successful}/${total} video đã được xóa thành công`);
      }
      
      // Invalidate all lessons queries
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa video thất bại");
    },
  });
}

// Hook for confirming video deletion
export function useDeleteVideoWithConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteVideoInput & { confirmed?: boolean }) => {
      if (!params.confirmed) {
        throw new Error("Vui lòng xác nhận xóa video");
      }

      const result = await deleteVideo(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Video đã được xóa thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["lessons"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa video thất bại");
    },
  });
} 