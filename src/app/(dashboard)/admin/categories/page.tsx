import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import CategoriesManagementContainer from "./_components/categories-management-container";

export default async function CategoriesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý danh mục"
        description="Tạo và quản lý danh mục cho các khóa học"
      />
      <Suspense fallback={<div>Đang tải...</div>}>
        <CategoriesManagementContainer />
      </Suspense>
    </div>
  );
}
