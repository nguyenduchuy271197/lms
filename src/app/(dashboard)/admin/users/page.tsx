import { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import { UserManagementContainer } from "./_components/user-management-container";

export const metadata: Metadata = {
  title: "Quản lý người dùng",
  description: "Quản lý tài khoản và phân quyền người dùng trong hệ thống",
  keywords: [
    "quản lý người dùng",
    "admin users",
    "user management",
    "phân quyền",
  ],
  openGraph: {
    title: "Quản lý người dùng | LMS",
    description: "Quản lý tài khoản và phân quyền người dùng trong hệ thống",
  },
};

export default async function UsersPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản và phân quyền người dùng trong hệ thống"
      />
      <Suspense fallback={<Loading text="Đang tải danh sách người dùng..." />}>
        <UserManagementContainer />
      </Suspense>
    </div>
  );
}
