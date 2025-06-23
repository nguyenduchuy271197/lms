"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Filter } from "lucide-react";
import { GetAllStudentsAdminInput } from "@/lib/validations/admin-student-management";
import { LABELS } from "@/constants/labels";

interface StudentsFiltersProps {
  filters: GetAllStudentsAdminInput;
  onFiltersChange: (filters: Partial<GetAllStudentsAdminInput>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function StudentsFilters({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: StudentsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchValue });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (!value) {
      onFiltersChange({ search: undefined });
    }
  };

  const handleRoleChange = (role: string) => {
    onFiltersChange({
      role: role === "all" ? undefined : (role as "student" | "admin"),
    });
  };

  const handleEnrollmentStatusChange = (status: string) => {
    onFiltersChange({
      enrollment_status:
        status === "all"
          ? undefined
          : (status as "active" | "completed" | "dropped"),
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      sort_by: sortBy as GetAllStudentsAdminInput["sort_by"],
    });
  };

  const handleSortOrderChange = (order: string) => {
    onFiltersChange({
      sort_order: order as "asc" | "desc",
    });
  };

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({
      search: undefined,
      role: undefined,
      enrollment_status: undefined,
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Row */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {LABELS.UI.search}
            </Button>
          </form>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lọc:</span>
            </div>

            <Select
              value={filters.role || "all"}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="student">
                  {LABELS.USER_ROLES.student}
                </SelectItem>
                <SelectItem value="admin">{LABELS.USER_ROLES.admin}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.enrollment_status || "all"}
              onValueChange={handleEnrollmentStatusChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái ghi danh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">
                  {LABELS.ENROLLMENT_STATUS.active}
                </SelectItem>
                <SelectItem value="completed">
                  {LABELS.ENROLLMENT_STATUS.completed}
                </SelectItem>
                <SelectItem value="dropped">
                  {LABELS.ENROLLMENT_STATUS.dropped}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sort_by || "created_at"}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Ngày tạo</SelectItem>
                <SelectItem value="full_name">Tên</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="enrollments_count">Số khóa học</SelectItem>
                <SelectItem value="completed_courses">
                  Khóa học hoàn thành
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sort_order || "desc"}
              onValueChange={handleSortOrderChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={isLoading}
            >
              Xóa bộ lọc
            </Button>

            <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
