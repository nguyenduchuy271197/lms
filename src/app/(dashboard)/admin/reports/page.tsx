import { Suspense } from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import ReportsContainer from "./_components/reports-container";

export const metadata: Metadata = {
  title: "Báo cáo hệ thống",
  description:
    "Thống kê và phân tích dữ liệu học tập, hiệu suất khóa học và hoạt động người dùng",
  keywords: ["báo cáo", "thống kê", "analytics", "reports", "admin"],
  openGraph: {
    title: "Báo cáo hệ thống | LMS",
    description:
      "Thống kê và phân tích dữ liệu học tập, hiệu suất khóa học và hoạt động người dùng",
  },
};

export default async function ReportsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo hệ thống"
        description="Thống kê và phân tích dữ liệu học tập"
      />
      <Suspense fallback={<Loading text="Đang tải báo cáo..." />}>
        <ReportsContainer />
      </Suspense>
    </div>
  );
}
