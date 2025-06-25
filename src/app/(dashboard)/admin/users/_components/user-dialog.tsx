"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUserById } from "@/hooks/user-management/use-user-by-id";
import { useUpdateUserProfile } from "@/hooks/user-management/use-update-user-profile";
import { LABELS } from "@/constants/labels";

const userFormSchema = z.object({
  full_name: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên quá dài"),
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["student", "admin"] as const, {
    required_error: "Vai trò là bắt buộc",
  }),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function UserDialog({ isOpen, onClose, userId }: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "admin">(
    "student"
  );
  const isEditing = !!userId;

  const { data: user, isLoading: isLoadingUser } = useUserById(
    { id: userId || "" },
    isEditing
  );

  const updateUserMutation = useUpdateUserProfile();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: "student",
    },
  });

  // Reset form when dialog opens/closes or user data changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && user && !isLoadingUser) {
        // Wait for user data to be fully loaded
        const formData = {
          full_name: user.full_name || "",
          email: user.email,
          role: user.role,
        };
        form.reset(formData);
        setSelectedRole(user.role);
      } else if (!isEditing) {
        form.reset({
          full_name: "",
          email: "",
          role: "student",
        });
        setSelectedRole("student");
      }
    }
  }, [isOpen, user, isEditing, isLoadingUser, form]);

  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      await updateUserMutation.mutateAsync({
        id: userId!,
        ...data,
      });
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" key={userId}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin người dùng"
              : "Tạo tài khoản người dùng mới trong hệ thống"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingUser && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Nhập địa chỉ email"
                        disabled={isEditing}
                        className={isEditing ? "bg-muted" : ""}
                        {...field}
                      />
                    </FormControl>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">
                        Email không thể thay đổi
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedRole(value as "student" | "admin");
                        }}
                        value={selectedRole}
                        key={`${userId}-${selectedRole}`} // Force re-render when value changes
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">
                            {LABELS.USER_ROLES.student}
                          </SelectItem>
                          <SelectItem value="admin">
                            {LABELS.USER_ROLES.admin}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || updateUserMutation.isPending}
                >
                  {isLoading || updateUserMutation.isPending
                    ? "Đang xử lý..."
                    : isEditing
                    ? "Cập nhật"
                    : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
