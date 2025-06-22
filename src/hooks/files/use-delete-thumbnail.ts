"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteThumbnail } from "@/actions/files/delete-thumbnail";
import { type DeleteThumbnailInput } from "@/lib/validations/file-management";
import { toast } from "sonner";

export function useDeleteThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteThumbnailInput) => {
      const result = await deleteThumbnail(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Thumbnail đã được xóa thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["course", variables.courseId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["courses"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa thumbnail thất bại");
    },
  });
}

// Hook for batch thumbnail deletion
export function useBatchDeleteThumbnails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thumbnails: DeleteThumbnailInput[]) => {
      const results = await Promise.allSettled(
        thumbnails.map(thumbnail => deleteThumbnail(thumbnail))
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
        total: thumbnails.length
      };
    },
    onSuccess: (data) => {
      const { successful, failed, total } = data;
      
      if (failed === 0) {
        toast.success(`Tất cả ${total} thumbnail đã được xóa thành công`);
      } else {
        toast.warning(`${successful}/${total} thumbnail đã được xóa thành công`);
      }
      
      // Invalidate all courses queries
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa thumbnail thất bại");
    },
  });
}

// Hook for confirming thumbnail deletion
export function useDeleteThumbnailWithConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteThumbnailInput & { confirmed?: boolean }) => {
      if (!params.confirmed) {
        throw new Error("Vui lòng xác nhận xóa thumbnail");
      }

      const result = await deleteThumbnail(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Thumbnail đã được xóa thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["course", variables.courseId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["courses"] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa thumbnail thất bại");
    },
  });
} 