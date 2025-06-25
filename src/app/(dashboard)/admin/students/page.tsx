import { Suspense } from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import StudentsManagementContainer from "./_components/students-management-container";

export const metadata: Metadata = {
  title: "Quản lý học viên",
  description:
    "Quản lý học viên và theo dõi tiến độ học tập của toàn bộ hệ thống",
  keywords: [
    "quản lý học viên",
    "admin students",
    "student management",
    "học viên",
  ],
  openGraph: {
    title: "Quản lý học viên | LMS",
    description:
      "Quản lý học viên và theo dõi tiến độ học tập của toàn bộ hệ thống",
  },
};

export default async function StudentsPage() {
  // Require admin access
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý học viên"
        description="Quản lý học viên và theo dõi tiến độ học tập"
      />

      <Suspense fallback={<Loading text="Đang tải danh sách học viên..." />}>
        <StudentsManagementContainer />
      </Suspense>
    </div>
  );
}
