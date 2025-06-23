"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCategories } from "@/hooks/categories/use-categories";
import { Category } from "@/types/custom.types";
import CategoriesTable from "./categories-table";
import CategoryDialog from "./category-dialog";
import { PageHeader } from "@/components/shared/page-header";

export default function CategoriesManagementContainer() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: categories = [], isLoading, refetch } = useCategories();

  const handleCreateCategory = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseDialogs();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý danh mục"
        description="Tạo và quản lý danh mục cho các khóa học"
        action={
          <Button onClick={handleCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo danh mục mới
          </Button>
        }
      />
      {/* Main Content */}
      <Card className="p-6">
        <CategoriesTable
          categories={categories}
          isLoading={isLoading}
          onEdit={handleEditCategory}
          onRefresh={refetch}
        />
      </Card>

      {/* Dialogs */}
      <CategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        onSuccess={handleSuccess}
      />

      <CategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
