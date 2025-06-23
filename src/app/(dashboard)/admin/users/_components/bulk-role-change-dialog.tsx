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
import { Badge } from "@/components/ui/badge";
import { useBulkAction } from "@/hooks/user-management/use-bulk-action";
import { UserRole } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";

interface BulkRoleChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userIds: string[];
  onSuccess: () => void;
}

export function BulkRoleChangeDialog({
  isOpen,
  onClose,
  userIds,
  onSuccess,
}: BulkRoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const bulkActionMutation = useBulkAction();

  const handleSubmit = async () => {
    if (!selectedRole) return;

    await bulkActionMutation.mutateAsync({
      user_ids: userIds,
      action: "change_role",
      role: selectedRole,
    });

    handleClose();
    onSuccess();
  };

  const handleClose = () => {
    onClose();
    setSelectedRole(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thay đổi vai trò hàng loạt</DialogTitle>
          <DialogDescription>
            Thay đổi vai trò cho tất cả người dùng đã chọn. Thao tác này sẽ ảnh
            hưởng đến quyền truy cập của họ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Users Count */}
          <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
            <Badge variant="secondary" className="text-sm">
              {userIds.length} người dùng được chọn
            </Badge>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Chọn vai trò mới</Label>
            <RadioGroup
              value={selectedRole || ""}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="student" id="bulk-student" />
                <Label
                  htmlFor="bulk-student"
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
                <RadioGroupItem value="admin" id="bulk-admin" />
                <Label
                  htmlFor="bulk-admin"
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

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              ⚠️ Thao tác này sẽ thay đổi vai trò cho tất cả {userIds.length}{" "}
              người dùng đã chọn. Hãy chắc chắn rằng bạn muốn thực hiện hành
              động này.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={bulkActionMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || bulkActionMutation.isPending}
          >
            {bulkActionMutation.isPending
              ? "Đang cập nhật..."
              : "Cập nhật vai trò"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
