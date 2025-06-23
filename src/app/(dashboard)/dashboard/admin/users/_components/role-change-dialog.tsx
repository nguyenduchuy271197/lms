"use client";

import { useState } from "react";
import { Shield, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChangeRole } from "@/hooks/users/use-change-role";
import { Profile, UserRole } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";

interface RoleChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUser?: Profile;
}

export function RoleChangeDialog({
  isOpen,
  onClose,
  userId,
  currentUser,
}: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const changeRoleMutation = useChangeRole();

  const handleSubmit = async () => {
    if (!userId || !selectedRole) return;

    const result = await changeRoleMutation.mutateAsync({
      userId,
      role: selectedRole,
    });

    if (result.success) {
      onClose();
      setSelectedRole(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedRole(null);
  };

  const getUserInitials = (user: Profile) => {
    if (user.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thay đổi vai trò người dùng</DialogTitle>
          <DialogDescription>
            Chọn vai trò mới cho người dùng này. Thay đổi vai trò sẽ ảnh hưởng
            đến quyền truy cập của họ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar_url || undefined} />
              <AvatarFallback>{getUserInitials(currentUser)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {currentUser.full_name || "Chưa cập nhật"}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentUser.email}
              </div>
              <div className="text-xs text-muted-foreground">
                Vai trò hiện tại: {LABELS.USER_ROLES[currentUser.role]}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Chọn vai trò mới</Label>
            <RadioGroup
              value={selectedRole || ""}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="student" id="student" />
                <Label
                  htmlFor="student"
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                >
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">
                      {LABELS.USER_ROLES.student}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Có thể xem và học các khóa học
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="admin" id="admin" />
                <Label
                  htmlFor="admin"
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                >
                  <Shield className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{LABELS.USER_ROLES.admin}</div>
                    <div className="text-sm text-muted-foreground">
                      Có thể quản lý hệ thống và người dùng
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={changeRoleMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedRole ||
              selectedRole === currentUser.role ||
              changeRoleMutation.isPending
            }
          >
            {changeRoleMutation.isPending
              ? "Đang cập nhật..."
              : "Cập nhật vai trò"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
