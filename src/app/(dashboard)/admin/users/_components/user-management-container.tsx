"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { UserFilters } from "./user-filters";
import { UserTable } from "./user-table";
import { UserDialog } from "./user-dialog";
import { UserBulkActions } from "./user-bulk-actions";
import { useAllUsers } from "@/hooks/user-management/use-all-users";
import { useProfile } from "@/hooks/users/use-profile";
import { UserRole } from "@/types/custom.types";

export function UserManagementContainer() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | undefined>(undefined);

  const { data: currentUser } = useProfile();

  const {
    data: usersData,
    isLoading,
    error,
  } = useAllUsers({
    search: search || undefined,
    role: roleFilter,
    page,
    limit: 10,
  });

  const handleEditUser = (userId: string) => {
    setEditUserId(userId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditUserId(undefined);
  };

  const handleSelectionChange = (userIds: string[]) => {
    setSelectedUsers(userIds);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Có lỗi xảy ra khi tải dữ liệu người dùng
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <UserFilters
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <UserBulkActions
                selectedUserIds={selectedUsers}
                onSuccess={() => setSelectedUsers([])}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <UserTable
          data={usersData}
          isLoading={isLoading}
          selectedUsers={selectedUsers}
          onSelectionChange={handleSelectionChange}
          onEditUser={handleEditUser}
          currentPage={page}
          onPageChange={setPage}
          currentUserId={currentUser?.id}
        />
      </Card>

      {/* User Dialog */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        userId={editUserId}
      />
    </div>
  );
}
