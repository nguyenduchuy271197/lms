"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/auth";
import { useUpdateProfile } from "@/hooks/users/use-update-profile";
import { useUploadAvatarWithPreview } from "@/hooks/files/use-upload-avatar";
import { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Camera } from "lucide-react";
import { getUserRoleLabel } from "@/constants/labels";
import { toast } from "sonner";

interface ProfileFormProps {
  user: AuthUser;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    user.profile.avatar_url
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: user.profile.full_name || "",
      avatar_url: user.profile.avatar_url || "",
    },
  });

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatarWithPreview();

  // Update local avatar URL when user prop changes
  useEffect(() => {
    setCurrentAvatarUrl(user.profile.avatar_url);
    form.setValue("avatar_url", user.profile.avatar_url || "");
  }, [user.profile.avatar_url, form]);

  const handleSubmit = (data: UpdateProfileInput) => {
    updateProfile.mutate(data);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WebP");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    uploadAvatar.mutate(
      {
        params: { userId: user.id },
        formData,
        onPreview: setPreviewUrl,
      },
      {
        onSuccess: (data) => {
          if (data) {
            // Update both form and local state
            form.setValue("avatar_url", data.fileUrl);
            setCurrentAvatarUrl(data.fileUrl);
          }
          setPreviewUrl(null);
        },
        onError: () => setPreviewUrl(null),
      }
    );
  };

  const openFileDialog = () => {
    if (!uploadAvatar.isPending) {
      fileInputRef.current?.click();
    }
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayAvatarUrl = previewUrl || currentAvatarUrl;
  const isLoading = updateProfile.isPending || uploadAvatar.isPending;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar
            className="h-20 w-20 cursor-pointer hover:opacity-80"
            onClick={openFileDialog}
          >
            <AvatarImage
              src={displayAvatarUrl || ""}
              alt={user.profile.full_name || ""}
            />
            <AvatarFallback className="text-lg">
              {getUserInitials(user.profile.full_name)}
            </AvatarFallback>
          </Avatar>

          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={openFileDialog}
          >
            {uploadAvatar.isPending ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">
              {user.profile.full_name || "Chưa có tên"}
            </h3>
            <Badge variant="secondary">
              {getUserRoleLabel(user.profile.role)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={uploadAvatar.isPending}
          >
            {uploadAvatar.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Thay đổi ảnh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Profile Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Họ và tên</Label>
          <Input
            id="full_name"
            {...form.register("full_name")}
            disabled={isLoading}
            placeholder="Nhập họ và tên"
          />
          {form.formState.errors.full_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.full_name.message}
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email không thể thay đổi
          </p>
        </div>

        {/* Role (Read-only) */}
        <div className="space-y-2">
          <Label>Vai trò</Label>
          <Badge variant="outline">{getUserRoleLabel(user.profile.role)}</Badge>
        </div>

        {/* Created Date (Read-only) */}
        <div className="space-y-2">
          <Label>Ngày tạo tài khoản</Label>
          <p className="text-sm">
            {new Date(user.profile.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Save Button */}
        <Button type="submit" disabled={isLoading}>
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </form>
    </div>
  );
}
