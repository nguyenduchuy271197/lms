"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Users, BookOpen, Clock, TrendingUp } from "lucide-react";
import { TablePagination } from "@/components/shared/table-pagination";
import { LABELS, formatDuration } from "@/constants/labels";
import { UserRole } from "@/types/custom.types";

interface StudentWithStats {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  enrollments_count: number;
  active_enrollments: number;
  completed_courses: number;
  total_watch_time: number;
  average_progress: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface StudentsTableProps {
  students: StudentWithStats[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onStudentSelect: (studentId: string) => void;
  isLoading: boolean;
}

export default function StudentsTable({
  students,
  pagination,
  onPageChange,
  onStudentSelect,
  isLoading,
}: StudentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!students.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              Không có dữ liệu học viên
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Danh sách học viên ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Hoàn thành</TableHead>
                <TableHead>Tiến độ TB</TableHead>
                <TableHead>Thời gian học</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar_url || undefined} />
                        <AvatarFallback>
                          {student.full_name?.charAt(0) ||
                            student.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {student.full_name || "Chưa cập nhật tên"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        student.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {LABELS.USER_ROLES[student.role]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {student.enrollments_count}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({student.active_enrollments} đang học)
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {student.completed_courses}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              student.average_progress
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {student.average_progress}%
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDuration(student.total_watch_time)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStudentSelect(student.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <TablePagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
