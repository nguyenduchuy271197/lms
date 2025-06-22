"use client";

import { useQuery } from "@tanstack/react-query";
import { getVideoMetadata } from "@/actions/files/get-video-metadata";
import { type GetVideoMetadataInput } from "@/lib/validations/file-management";

export function useVideoMetadata(
  params: GetVideoMetadataInput,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: ["video-metadata", params.lessonId, params.videoUrl],
    queryFn: async () => {
      const result = await getVideoMetadata(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 60, // 1 hour
  });
}

// Hook for getting video metadata by lesson ID
export function useVideoMetadataByLesson(
  lessonId: string
) {
  return useQuery({
    queryKey: ["video-metadata-by-lesson", lessonId],
    queryFn: async () => {
      // This would need to be implemented to get video URL from lesson first
      // then get metadata
      throw new Error("Not implemented - need lesson video URL first");
    },
    enabled: false, // Disabled until we implement the logic
  });
}

// Hook for batch video metadata
export function useBatchVideoMetadata(
  videos: GetVideoMetadataInput[],
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["batch-video-metadata", videos],
    queryFn: async () => {
      const results = await Promise.allSettled(
        videos.map(video => getVideoMetadata(video))
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<{ success: true; data: { duration: number; width: number; height: number; fileSize: number; format: string; bitrate?: number; fps?: number; hasAudio: boolean; thumbnailUrl?: string } }> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data);

      const failed = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        )
        .length;

      return {
        metadata: successful,
        failed,
        total: videos.length
      };
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook for video metadata with caching by course
export function useVideoMetadataByCourse(
  courseId: string,
  videos: Array<{ lessonId: string; videoUrl: string }>,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["video-metadata-course", courseId, videos],
    queryFn: async () => {
      const results = await Promise.allSettled(
        videos.map(({ lessonId, videoUrl }) => 
          getVideoMetadata({ lessonId, videoUrl })
        )
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<{ success: true; data: { duration: number; width: number; height: number; fileSize: number; format: string; bitrate?: number; fps?: number; hasAudio: boolean; thumbnailUrl?: string } }> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map((result, index) => ({
          lessonId: videos[index].lessonId,
          metadata: result.value.data
        }));

      const failed = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        )
        .length;

      return {
        courseId,
        videos: successful,
        failed,
        total: videos.length
      };
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours for course metadata
  });
} 