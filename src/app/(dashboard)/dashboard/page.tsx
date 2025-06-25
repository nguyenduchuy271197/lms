import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import DashboardStats from "./_components/dashboard-stats";
import DashboardActivity from "./_components/dashboard-activity";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Trang chủ hệ thống học tập - Theo dõi tiến độ học tập và quản lý khóa học của bạn",
  keywords: ["dashboard", "trang chủ", "tiến độ học tập", "quản lý"],
  openGraph: {
    title: "Dashboard | LMS",
    description:
      "Trang chủ hệ thống học tập - Theo dõi tiến độ học tập và quản lý khóa học của bạn",
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Chào mừng bạn quay trở lại với hệ thống học tập"
      />

      <DashboardStats />

      <DashboardActivity />
    </div>
  );
}
