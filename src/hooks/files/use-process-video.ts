"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processVideo } from "@/actions/files/process-video";
import { type ProcessVideoInput } from "@/lib/validations/file-management";
import { toast } from "sonner";

type ProcessingResult = {
  status: 'processing' | 'completed' | 'failed';
  processedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  quality: string;
  message: string;
};

export function useProcessVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ProcessVideoInput) => {
      const result = await processVideo(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Video đang được xử lý");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["video-metadata", variables.lessonId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xử lý video thất bại");
    },
  });
}

// Hook for batch video processing
export function useBatchProcessVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videos: ProcessVideoInput[]) => {
      const results = await Promise.allSettled(
        videos.map(video => processVideo(video))
      );

      const successful = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<{ success: true; data: ProcessingResult }>).value.data);

      const failed = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      ).length;

      return {
        successful,
        failed,
        total: videos.length
      };
    },
    onSuccess: (data) => {
      const { successful, failed, total } = data;
      
      if (failed === 0) {
        toast.success(`Tất cả ${total} video đang được xử lý`);
      } else {
        toast.warning(`${successful.length}/${total} video đang được xử lý`);
      }
      
      // Invalidate all lessons queries
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["video-metadata"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xử lý video thất bại");
    },
  });
}

// Hook for processing video with quality options
export function useProcessVideoWithQuality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ProcessVideoInput & { 
      qualities?: ("720p" | "1080p" | "auto")[];
      priority?: 'low' | 'normal' | 'high';
    }) => {
      const { qualities, ...videoParams } = params;
      
      // If multiple qualities specified, process for each quality
      if (qualities && qualities.length > 1) {
        const results = await Promise.allSettled(
          qualities.map(quality => 
            processVideo({ ...videoParams, quality })
          )
        );
        
        const successful = results
          .filter(result => result.status === 'fulfilled' && result.value.success)
          .map(result => (result as PromiseFulfilledResult<{ success: true; data: ProcessingResult }>).value.data);

        return {
          results: successful,
          total: qualities.length
        };
      } else {
        // Single quality processing
        const result = await processVideo(videoParams);
        if (!result.success) {
          throw new Error(result.error);
        }
        return { results: [result.data], total: 1 };
      }
    },
    onSuccess: (data, variables) => {
      const { total } = data;
      
      if (total === 1) {
        toast.success("Video đang được xử lý");
      } else {
        toast.success(`Video đang được xử lý với ${total} chất lượng khác nhau`);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["video-metadata", variables.lessonId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xử lý video thất bại");
    },
  });
}

// Hook for processing video with progress tracking
export function useProcessVideoWithProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ProcessVideoInput & {
      onProgress?: (progress: number) => void;
    }) => {
      const { onProgress, ...videoParams } = params;
      
      if (onProgress) {
        onProgress(0);
      }

      const result = await processVideo(videoParams);
      
      if (onProgress) {
        onProgress(100);
      }

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Video đã được xử lý thành công");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["lesson", variables.lessonId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["video-metadata", variables.lessonId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xử lý video thất bại");
    },
  });
}
