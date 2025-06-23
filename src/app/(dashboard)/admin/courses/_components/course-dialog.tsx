"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreateCourse } from "@/hooks/courses/use-create-course";
import { useUpdateCourse } from "@/hooks/courses/use-update-course";
import { useUploadThumbnail } from "@/hooks/courses/use-upload-thumbnail";
import { useCategories } from "@/hooks/categories/use-categories";
import { z } from "zod";
import { Course } from "@/types/custom.types";
import { generateSlug } from "@/lib/utils";
import { toast } from "sonner";
import { LABELS } from "@/constants/labels";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSuccess?: () => void;
}

export default function CourseDialog({
  open,
  onOpenChange,
  course,
  onSuccess,
}: CourseDialogProps) {
  const isEditing = Boolean(course);
  const { data: categories } = useCategories();

  // State for thumbnail preview
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const { mutate: uploadThumbnail, isPending: isUploading } =
    useUploadThumbnail();

  // Form schema - create a consistent schema for form validation
  const formSchema = z.object({
    title: z
      .string()
      .min(1, "Tiêu đề khóa học là bắt buộc")
      .min(2, "Tiêu đề quá ngắn")
      .max(200, "Tiêu đề quá dài"),
    description: z.string().nullable().optional(),
    objectives: z.string().nullable().optional(),
    slug: z
      .string()
      .min(1, "Slug là bắt buộc")
      .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
    category_id: z.string().nullable().optional(),
    is_published: z.boolean().default(false),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      objectives: "",
      slug: "",
      category_id: "",
      is_published: false,
    },
  });

  // Reset form when course changes
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description || "",
        objectives: course.objectives || "",
        slug: course.slug,
        category_id: course.category_id || "",
        is_published: course.is_published,
      });
      setThumbnailPreview(null);
      setThumbnailFile(null);
    } else if (open) {
      form.reset({
        title: "",
        description: "",
        objectives: "",
        slug: "",
        category_id: "",
        is_published: false,
      });
      setThumbnailPreview(null);
      setThumbnailFile(null);
    }
  }, [course, open, form]);

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!isEditing && watchTitle) {
      const slug = generateSlug(watchTitle);
      form.setValue("slug", slug);
    }
  }, [watchTitle, isEditing, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing && course) {
      updateCourse(
        { id: course.id, ...data },
        {
          onSuccess: () => {
            toast.success(LABELS.SUCCESS.updated);
            // Upload thumbnail if there's a new file
            if (thumbnailFile) {
              handleThumbnailUploadForCourse(course.id);
            }
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(error.message || "Cập nhật khóa học thất bại");
          },
        }
      );
    } else {
      createCourse(data, {
        onSuccess: (newCourse) => {
          toast.success(LABELS.SUCCESS.created);
          // Upload thumbnail if there's a file
          if (thumbnailFile && newCourse) {
            handleThumbnailUploadForCourse(newCourse.id);
          }
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(error.message || "Tạo khóa học thất bại");
        },
      });
    }
  };

  const handleThumbnailSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh quá lớn (tối đa 5MB)");
      return;
    }

    setThumbnailFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailUploadForCourse = (courseId: string) => {
    if (!thumbnailFile) return;

    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    uploadThumbnail(
      { courseId, formData },
      {
        onSuccess: () => {
          toast.success("Tải thumbnail thành công");
          setThumbnailFile(null);
          setThumbnailPreview(null);
        },
        onError: (error) => {
          toast.error(error.message || "Tải thumbnail thất bại");
        },
      }
    );
  };

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !course) return;

    const formData = new FormData();
    formData.append("thumbnail", file);

    uploadThumbnail(
      { courseId: course.id, formData },
      {
        onSuccess: () => {
          toast.success("Tải thumbnail thành công");
        },
        onError: (error) => {
          toast.error(error.message || "Tải thumbnail thất bại");
        },
      }
    );
  };

  const removeThumbnailPreview = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <FormLabel>Thumbnail khóa học</FormLabel>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-28 rounded-md">
                  <AvatarImage
                    src={
                      thumbnailPreview ||
                      (isEditing && course?.thumbnail_url) ||
                      ""
                    }
                    alt={isEditing ? course?.title : "Thumbnail preview"}
                  />
                  <AvatarFallback className="rounded-md">
                    <Upload className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        isEditing
                          ? handleThumbnailUpload
                          : handleThumbnailSelect
                      }
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="thumbnail-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading
                            ? "Đang tải..."
                            : isEditing
                            ? "Thay đổi thumbnail"
                            : "Chọn thumbnail"}
                        </span>
                      </Button>
                    </label>
                    {thumbnailPreview && !isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeThumbnailPreview}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chỉ chấp nhận file ảnh (JPG, PNG, WebP, tối đa 5MB)
                  </p>
                  {thumbnailFile && !isEditing && (
                    <p className="text-xs text-green-600 mt-1">
                      Đã chọn: {thumbnailFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tiêu đề khóa học *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề khóa học..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="slug-khoa-hoc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Không có danh mục</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Mô tả khóa học</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về khóa học..."
                      className="min-h-[100px]"
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mục tiêu học tập</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Những gì học viên sẽ đạt được sau khi hoàn thành khóa học..."
                      className="min-h-[100px]"
                      value={field.value || ""}
                      onChange={field.onChange}
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
                      Xuất bản khóa học
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Khóa học sẽ hiển thị công khai cho học viên
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
                  : "Tạo khóa học"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
