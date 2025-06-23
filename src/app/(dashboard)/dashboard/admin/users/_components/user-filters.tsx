"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";

interface UserFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  roleFilter: UserRole | undefined;
  onRoleFilterChange: (role: UserRole | undefined) => void;
}

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Search Input */}
      <div className="relative min-w-[250px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Filter */}
      <Select
        value={roleFilter || "all"}
        onValueChange={(value) =>
          onRoleFilterChange(value === "all" ? undefined : (value as UserRole))
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả vai trò</SelectItem>
          <SelectItem value="student">{LABELS.USER_ROLES.student}</SelectItem>
          <SelectItem value="admin">{LABELS.USER_ROLES.admin}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
