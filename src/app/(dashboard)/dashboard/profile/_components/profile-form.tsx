"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/auth";
import { useUpdateProfile } from "@/hooks/users/use-update-profile";
import { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload } from "lucide-react";
import { getUserRoleLabel } from "@/constants/labels";

interface ProfileFormProps {
  user: AuthUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: user.profile.full_name || "",
      avatar_url: user.profile.avatar_url || "",
    },
  });

  const updateProfile = useUpdateProfile();

  const onSubmit = (data: UpdateProfileInput) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    form.reset({
      full_name: user.profile.full_name || "",
      avatar_url: user.profile.avatar_url || "",
    });
    setIsEditing(false);
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

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user.profile.avatar_url || ""}
            alt={user.profile.full_name || ""}
          />
          <AvatarFallback className="text-lg">
            {getUserInitials(user.profile.full_name)}
          </AvatarFallback>
        </Avatar>
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
          {isEditing && (
            <Button type="button" variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Thay đổi ảnh đại diện
            </Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              {...form.register("full_name")}
              disabled={!isEditing || updateProfile.isPending}
              placeholder="Nhập họ và tên"
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

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
        </div>

        <div className="space-y-2">
          <Label>Vai trò</Label>
          <div>
            <Badge variant="outline">
              {getUserRoleLabel(user.profile.role)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ngày tạo tài khoản</Label>
          <p className="text-sm">
            {new Date(user.profile.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Chỉnh sửa thông tin
            </Button>
          ) : (
            <>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                Hủy
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
