import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import CategoriesManagementContainer from "./_components/categories-management-container";

export default async function CategoriesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý danh mục"
        description="Tạo và quản lý danh mục cho các khóa học"
      />
      <Suspense fallback={<Loading text="Đang tải danh sách danh mục..." />}>
        <CategoriesManagementContainer />
      </Suspense>
    </div>
  );
}
