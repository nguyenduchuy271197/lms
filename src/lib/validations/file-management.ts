import { z } from "zod";

// Upload Video Schema
export const uploadLessonVideoSchema = z.object({
  courseId: z.string().uuid("Course ID phải là UUID hợp lệ"),
  lessonId: z.string().uuid("Lesson ID phải là UUID hợp lệ"),
});

// Delete Video Schema
export const deleteVideoSchema = z.object({
  lessonId: z.string().uuid("Lesson ID phải là UUID hợp lệ"),
  videoUrl: z.string().url("URL video không hợp lệ"),
});

// Upload Thumbnail Schema
export const uploadCourseThumbnailSchema = z.object({
  courseId: z.string().uuid("Course ID phải là UUID hợp lệ"),
});

// Delete Thumbnail Schema
export const deleteThumbnailSchema = z.object({
  courseId: z.string().uuid("Course ID phải là UUID hợp lệ"),
  thumbnailUrl: z.string().url("URL thumbnail không hợp lệ"),
});

// Upload User Avatar Schema
export const uploadUserAvatarSchema = z.object({
  userId: z.string().uuid("User ID phải là UUID hợp lệ"),
});

// Get File URL Schema
export const getFileUrlSchema = z.object({
  bucket: z.enum(["course-videos", "course-thumbnails", "user-avatars"], {
    errorMap: () => ({ message: "Bucket không hợp lệ" }),
  }),
  filePath: z.string().min(1, "Đường dẫn file là bắt buộc"),
  expiresIn: z.number().min(60).max(86400).optional(), // 1 minute to 1 day
});

// Get Video Metadata Schema
export const getVideoMetadataSchema = z.object({
  lessonId: z.string().uuid("Lesson ID phải là UUID hợp lệ"),
  videoUrl: z.string().url("URL video không hợp lệ"),
});

// Process Video Schema
export const processVideoSchema = z.object({
  lessonId: z.string().uuid("Lesson ID phải là UUID hợp lệ"),
  videoUrl: z.string().url("URL video không hợp lệ"),
  quality: z.enum(["720p", "1080p", "auto"], {
    errorMap: () => ({ message: "Chất lượng video không hợp lệ" }),
  }).default("auto"),
  generateThumbnail: z.boolean().default(true),
});

// File Upload Response Schema
export const fileUploadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    fileUrl: z.string().url(),
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    bucket: z.string(),
    path: z.string(),
  }).optional(),
  error: z.string().optional(),
});

// Video Metadata Response Schema
export const videoMetadataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    duration: z.number(), // in seconds
    width: z.number(),
    height: z.number(),
    fileSize: z.number(),
    format: z.string(),
    bitrate: z.number().optional(),
    fps: z.number().optional(),
    hasAudio: z.boolean(),
    thumbnailUrl: z.string().url().optional(),
  }).optional(),
  error: z.string().optional(),
});

// Type exports for TypeScript
export type UploadLessonVideoInput = z.infer<typeof uploadLessonVideoSchema>;
export type DeleteVideoInput = z.infer<typeof deleteVideoSchema>;
export type UploadCourseThumbnailInput = z.infer<typeof uploadCourseThumbnailSchema>;
export type DeleteThumbnailInput = z.infer<typeof deleteThumbnailSchema>;
export type UploadUserAvatarInput = z.infer<typeof uploadUserAvatarSchema>;
export type GetFileUrlInput = z.infer<typeof getFileUrlSchema>;
export type GetVideoMetadataInput = z.infer<typeof getVideoMetadataSchema>;
export type ProcessVideoInput = z.infer<typeof processVideoSchema>;
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
export type VideoMetadataResponse = z.infer<typeof videoMetadataResponseSchema>; 