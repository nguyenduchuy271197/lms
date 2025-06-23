import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import StudentsManagementContainer from "./_components/students-management-container";

export default async function StudentsPage() {
  // Require admin access
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý học viên"
        description="Quản lý học viên và theo dõi tiến độ học tập"
      />

      <Suspense fallback={<div>Đang tải...</div>}>
        <StudentsManagementContainer />
      </Suspense>
    </div>
  );
}
