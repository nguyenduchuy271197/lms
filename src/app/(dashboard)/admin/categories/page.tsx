import { Suspense } from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Loading } from "@/components/shared/loading";
import CategoriesManagementContainer from "./_components/categories-management-container";

export const metadata: Metadata = {
  title: "Quản lý danh mục",
  description: "Quản lý danh mục khóa học và tổ chức nội dung hệ thống",
  keywords: [
    "quản lý danh mục",
    "admin categories",
    "category management",
    "danh mục",
  ],
  openGraph: {
    title: "Quản lý danh mục | LMS",
    description: "Quản lý danh mục khóa học và tổ chức nội dung hệ thống",
  },
};

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
