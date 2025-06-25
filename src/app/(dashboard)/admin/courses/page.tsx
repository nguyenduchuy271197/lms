import { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { Loading } from "@/components/shared/loading";
import CourseManagementContainer from "./_components/course-management-container";

export const metadata: Metadata = {
  title: "Quản lý khóa học",
  description:
    "Quản lý danh sách khóa học của hệ thống - Tạo, chỉnh sửa và theo dõi khóa học",
  keywords: [
    "quản lý khóa học",
    "admin courses",
    "course management",
    "khóa học",
  ],
  openGraph: {
    title: "Quản lý khóa học | LMS",
    description:
      "Quản lý danh sách khóa học của hệ thống - Tạo, chỉnh sửa và theo dõi khóa học",
  },
};

export default async function CourseManagementPage() {
  // Require admin authentication
  await requireAdmin();

  return (
    <div className="space-y-6">
      <Suspense fallback={<Loading text="Đang tải danh sách khóa học..." />}>
        <CourseManagementContainer />
      </Suspense>
    </div>
  );
}
