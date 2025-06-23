"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Category } from "@/types/custom.types";
import { useDeleteCategory } from "@/hooks/categories/use-delete-category";

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onRefresh: () => void;
}

export default function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onRefresh,
}: CategoriesTableProps) {
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const deleteMutation = useDeleteCategory({
    onSuccess: () => {
      onRefresh();
      setDeleteCategory(null);
    },
  });

  const handleDelete = async () => {
    if (!deleteCategory) return;

    try {
      await deleteMutation.mutateAsync({ id: deleteCategory.id });
    } catch (error) {
      console.error("Delete category error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Chưa có danh mục nào</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Ngày cập nhật</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-xs">
                  {category.slug}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                {category.description ? (
                  <span className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Chưa có mô tả
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(category.created_at), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(category.updated_at), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(`/categories/${category.slug}`, "_blank")
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Xem trang danh mục
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteCategory(category)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteCategory?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}
