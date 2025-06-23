import { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import CourseManagementContainer from "./_components/course-management-container";

export const metadata: Metadata = {
  title: "Quản lý khóa học",
  description: "Quản lý danh sách khóa học của hệ thống",
};

export default async function CourseManagementPage() {
  // Require admin authentication
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khóa học"
        description="Tạo, chỉnh sửa và quản lý các khóa học trong hệ thống"
      />
      <Suspense fallback={<Loading text="Đang tải danh sách khóa học..." />}>
        <CourseManagementContainer />
      </Suspense>
    </div>
  );
}
