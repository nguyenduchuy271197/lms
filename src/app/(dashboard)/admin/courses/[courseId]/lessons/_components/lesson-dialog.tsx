"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateLesson } from "@/hooks/lessons/use-create-lesson";
import { useUpdateLesson } from "@/hooks/lessons/use-update-lesson";
import { z } from "zod";
import { Lesson } from "@/types/custom.types";
import { toast } from "sonner";
import { LABELS } from "@/constants/labels";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  lesson?: Lesson | null;
  onSuccess?: () => void;
}

// Form schemas for dialog (subset of full validation schemas)
const lessonFormSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề bài học là bắt buộc")
    .min(2, "Tiêu đề quá ngắn"),
  description: z.string().optional(),
  lesson_type: z.literal("video"),
  video_url: z.string().optional(),
  duration_seconds: z.number().min(0, "Thời lượng không được âm").optional(),
  is_published: z.boolean(),
});

export default function LessonDialog({
  open,
  onOpenChange,
  courseId,
  lesson,
  onSuccess,
}: LessonDialogProps) {
  const isEditing = Boolean(lesson);

  const { mutate: createLesson, isPending: isCreating } = useCreateLesson();
  const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson();

  const form = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      description: "",
      lesson_type: "video" as const,
      video_url: "",
      duration_seconds: 0,
      is_published: false,
    },
  });

  // Reset form when lesson changes
  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        description: lesson.description || "",
        lesson_type: lesson.lesson_type,
        video_url: lesson.video_url || "",
        duration_seconds: lesson.duration_seconds || 0,
        is_published: lesson.is_published,
      });
    } else if (open) {
      form.reset({
        title: "",
        description: "",
        lesson_type: "video",
        video_url: "",
        duration_seconds: 0,
        is_published: false,
      });
    }
  }, [lesson, open, form]);

  const onSubmit = (data: Record<string, unknown>) => {
    if (isEditing && lesson) {
      updateLesson(
        { id: lesson.id, ...data },
        {
          onSuccess: () => {
            toast.success(LABELS.SUCCESS.updated);
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(error.message || "Cập nhật bài học thất bại");
          },
        }
      );
    } else {
      // Get the highest order_index + 1 for new lesson
      const order_index = 1; // Will be set by server action

      createLesson(
        {
          course_id: courseId,
          title: data.title as string,
          description: (data.description as string) || null,
          lesson_type: "video" as const,
          video_url: (data.video_url as string) || null,
          duration_seconds: (data.duration_seconds as number) || 0,
          order_index,
          is_published: (data.is_published as boolean) || false,
        },
        {
          onSuccess: () => {
            toast.success(LABELS.SUCCESS.created);
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(error.message || "Tạo bài học thất bại");
          },
        }
      );
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tiêu đề bài học *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề bài học..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lesson_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại bài học *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn loại bài học" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng (giây)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả bài học</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về bài học..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Video</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Publish Status */}
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Xuất bản bài học
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Bài học sẽ hiển thị công khai cho học viên
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Đang xử lý..."
                  : isEditing
                  ? "Cập nhật"
                  : "Tạo bài học"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
