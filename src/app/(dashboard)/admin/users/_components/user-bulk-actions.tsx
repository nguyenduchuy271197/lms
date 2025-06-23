"use client";

import { useState } from "react";
import { Trash2, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BulkRoleChangeDialog } from "./bulk-role-change-dialog";
import { useBulkAction } from "@/hooks/user-management/use-bulk-action";

interface UserBulkActionsProps {
  selectedUserIds: string[];
  onSuccess: () => void;
}

export function UserBulkActions({
  selectedUserIds,
  onSuccess,
}: UserBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);

  const bulkActionMutation = useBulkAction();

  const handleBulkDelete = async () => {
    await bulkActionMutation.mutateAsync({
      user_ids: selectedUserIds,
      action: "delete",
    });
    setShowDeleteConfirm(false);
    onSuccess();
  };

  const handleBulkRoleChange = () => {
    setShowRoleChangeDialog(true);
  };

  const handleRoleChangeSuccess = () => {
    setShowRoleChangeDialog(false);
    onSuccess();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {selectedUserIds.length} đã chọn
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Hành động
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác hàng loạt</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBulkRoleChange}>
              <Shield className="h-4 w-4 mr-2" />
              Thay đổi vai trò
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tất cả
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Xóa nhiều người dùng"
        description={`Bạn có chắc chắn muốn xóa ${selectedUserIds.length} người dùng đã chọn? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tất cả"
        variant="destructive"
        isLoading={bulkActionMutation.isPending}
      />

      {/* Bulk Role Change Dialog */}
      <BulkRoleChangeDialog
        isOpen={showRoleChangeDialog}
        onClose={() => setShowRoleChangeDialog(false)}
        userIds={selectedUserIds}
        onSuccess={handleRoleChangeSuccess}
      />
    </>
  );
}
