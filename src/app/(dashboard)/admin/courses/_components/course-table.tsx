"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/shared/table-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCourses } from "@/hooks/courses/use-courses";
import { useDeleteCourse } from "@/hooks/courses/use-delete-course";
import { usePublishCourse } from "@/hooks/courses/use-publish-course";
import { Course } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";
import { toast } from "sonner";

interface CourseTableProps {
  search: string;
  categoryFilter: string;
  statusFilter: string;
  page: number;
  onPageChange: (page: number) => void;
  selectedCourses: string[];
  onSelectionChange: (courseIds: string[]) => void;
  onEditCourse: (course: Course) => void;
}

const ITEMS_PER_PAGE = 10;

export default function CourseTable({
  search,
  categoryFilter,
  statusFilter,
  page,
  onPageChange,
  selectedCourses,
  onSelectionChange,
  onEditCourse,
}: CourseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Fetch courses
  const { data: courses, isLoading, error } = useCourses();
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { mutate: publishCourse } = usePublishCourse();

  // Filter courses
  const filteredCourses =
    courses?.filter((course) => {
      const matchesSearch =
        search === "" ||
        course.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || course.category_id === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.is_published) ||
        (statusFilter === "draft" && !course.is_published);

      return matchesSearch && matchesCategory && matchesStatus;
    }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(paginatedCourses.map((course) => course.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedCourses, courseId]);
    } else {
      onSelectionChange(selectedCourses.filter((id) => id !== courseId));
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingCourse) return;

    deleteCourse(
      { id: deletingCourse.id },
      {
        onSuccess: () => {
          toast.success(LABELS.SUCCESS.deleted);
          setDeleteDialogOpen(false);
          setDeletingCourse(null);
        },
        onError: (error) => {
          toast.error(error.message || "Xóa khóa học thất bại");
        },
      }
    );
  };

  const handleTogglePublish = (course: Course) => {
    publishCourse(
      { id: course.id, is_published: !course.is_published },
      {
        onSuccess: () => {
          toast.success(
            course.is_published
              ? "Hủy xuất bản thành công"
              : "Xuất bản thành công"
          );
        },
        onError: (error) => {
          toast.error(error.message || "Cập nhật trạng thái thất bại");
        },
      }
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Có lỗi xảy ra khi tải danh sách khóa học
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedCourses.length > 0 &&
                    paginatedCourses.every((course) =>
                      selectedCourses.includes(course.id)
                    )
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không tìm thấy khóa học nào
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCourse(course.id, Boolean(checked))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-16 rounded-md">
                        <AvatarImage
                          src={course.thumbnail_url || ""}
                          alt={course.title}
                        />
                        <AvatarFallback className="rounded-md">
                          <BookOpen className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium line-clamp-1">
                          {course.title}
                        </p>
                        {/* {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        )} */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {/* TODO: Add category name from relations */}
                      Chưa phân loại
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={course.is_published ? "default" : "secondary"}
                    >
                      {course.is_published ? "Đã xuất bản" : "Bản nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(course.created_at), "dd/MM/yyyy", {
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
                        <DropdownMenuItem onClick={() => onEditCourse(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/admin/courses/${course.id}/lessons`}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Quản lý bài học
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(course)}
                        >
                          {course.is_published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Hủy xuất bản
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Xuất bản
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteCourse(course)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={filteredCourses.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Xóa khóa học"
        description={`Bạn có chắc chắn muốn xóa khóa học "${deletingCourse?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
