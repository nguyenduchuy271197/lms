import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import ReportsContainer from "./_components/reports-container";

export default async function ReportsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo hệ thống"
        description="Thống kê và phân tích dữ liệu học tập"
      />
      <Suspense fallback={<div>Đang tải báo cáo...</div>}>
        <ReportsContainer />
      </Suspense>
    </div>
  );
}
