import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { Loading } from "@/components/shared/loading";
import CategoriesManagementContainer from "./_components/categories-management-container";

export default async function CategoriesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading text="Đang tải danh sách danh mục..." />}>
        <CategoriesManagementContainer />
      </Suspense>
    </div>
  );
}
