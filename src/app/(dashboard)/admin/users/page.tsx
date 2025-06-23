import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { UserManagementContainer } from "./_components/user-management-container";

export const metadata: Metadata = {
  title: "Quản lý người dùng | LMS Admin",
  description: "Quản lý tài khoản và phân quyền người dùng",
};

export default async function UsersPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản và phân quyền người dùng trong hệ thống"
      />
      <UserManagementContainer />
    </div>
  );
}
