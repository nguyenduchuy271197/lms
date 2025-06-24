import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import ProfileForm from "./_components/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | LMS",
  description: "Quản lý thông tin hồ sơ cá nhân",
};

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin cá nhân và cài đặt tài khoản"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
