"use client";

import { useQuery } from "@tanstack/react-query";
import { getFileUrl } from "@/actions/files/get-file-url";
import { type GetFileUrlInput } from "@/lib/validations/file-management";

type FileUrlResult = {
  signedUrl: string;
  expiresAt: string;
  bucket: "course-videos" | "course-thumbnails" | "user-avatars";
  filePath: string;
};

export function useFileUrl(
  params: GetFileUrlInput,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: ["file-url", params.bucket, params.filePath, params.expiresIn],
    queryFn: async () => {
      const result = await getFileUrl(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 1000 * 60 * 30, // 30 minutes
    refetchInterval: options?.refetchInterval,
    // Refetch before URL expires
    refetchIntervalInBackground: true,
  });
}

// Hook for getting signed URL for course videos
export function useCourseVideoUrl(
  courseId: string,
  fileName: string,
  options?: {
    enabled?: boolean;
    expiresIn?: number;
  }
) {
  const filePath = `lessons/${courseId}/${fileName}`;
  
  return useFileUrl(
    {
      bucket: "course-videos",
      filePath,
      expiresIn: options?.expiresIn ?? 3600, // 1 hour default
    },
    {
      enabled: options?.enabled,
      staleTime: 1000 * 60 * 50, // 50 minutes (before expiry)
      refetchInterval: 1000 * 60 * 50, // Refresh before expiry
    }
  );
}

// Hook for getting public URL for course thumbnails
export function useCourseThumbnailUrl(
  fileName: string,
  options?: {
    enabled?: boolean;
  }
) {
  const filePath = `courses/${fileName}`;
  
  return useFileUrl(
    {
      bucket: "course-thumbnails",
      filePath,
      expiresIn: 86400, // 24 hours for thumbnails
    },
    {
      enabled: options?.enabled,
      staleTime: 1000 * 60 * 60 * 12, // 12 hours
    }
  );
}

// Hook for batch file URLs
export function useBatchFileUrls(
  files: GetFileUrlInput[],
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["batch-file-urls", files],
    queryFn: async () => {
      const results = await Promise.allSettled(
        files.map(file => getFileUrl(file))
      );

      const successful = results
        .filter((result): result is PromiseFulfilledResult<{ success: true; data: FileUrlResult }> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data);

      const failed = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        )
        .length;

      return {
        urls: successful,
        failed,
        total: files.length
      };
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
