"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/shared/table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RoleChangeDialog } from "./role-change-dialog";
import { useDeleteUser } from "@/hooks/user-management/use-delete-user";
import { PaginatedUsersResponse } from "@/actions/user-management/get-all-users";
import { Profile } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";

interface UserTableProps {
  data: PaginatedUsersResponse | undefined;
  isLoading: boolean;
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onEditUser: (userId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  currentUserId?: string;
}

export function UserTable({
  data,
  isLoading,
  selectedUsers,
  onSelectionChange,
  onEditUser,
  currentPage,
  onPageChange,
  currentUserId,
}: UserTableProps) {
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [roleChangeUserId, setRoleChangeUserId] = useState<string | null>(null);

  const deleteUserMutation = useDeleteUser();

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.users) {
      // Exclude current user from selection
      const selectableUsers = data.users
        .filter((user) => user.id !== currentUserId)
        .map((user) => user.id);
      onSelectionChange(selectableUsers);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleDeleteUser = async () => {
    if (deleteUserId) {
      await deleteUserMutation.mutateAsync({ id: deleteUserId });
      setDeleteUserId(null);
    }
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

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-6 w-[80px]" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  const users = data?.users || [];
  const selectableUsers = users.filter((user) => user.id !== currentUserId);
  const allSelected =
    selectableUsers.length > 0 &&
    selectedUsers.length === selectableUsers.length;
  const someSelected =
    selectedUsers.length > 0 && selectedUsers.length < selectableUsers.length;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected || someSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                Không tìm thấy người dùng nào
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    disabled={currentUserId === user.id}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.full_name || "Chưa cập nhật"}
                        {currentUserId === user.id && (
                          <Badge variant="outline" className="text-xs">
                            Bạn
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role === "admin" && (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    {user.role === "student" && (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {LABELS.USER_ROLES[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditUser(user.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      {currentUserId !== user.id && (
                        <>
                          <DropdownMenuItem
                            onClick={() => setRoleChangeUserId(user.id)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Đổi vai trò
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={onPageChange}
          totalItems={data.total}
          itemsPerPage={data.limit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Xóa người dùng"
        description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        isLoading={deleteUserMutation.isPending}
      />

      {/* Role Change Dialog */}
      <RoleChangeDialog
        isOpen={!!roleChangeUserId}
        onClose={() => setRoleChangeUserId(null)}
        userId={roleChangeUserId}
        currentUser={users.find((u) => u.id === roleChangeUserId)}
      />
    </div>
  );
}
