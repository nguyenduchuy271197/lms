import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import MyCoursesContainer from "./_components/my-courses-container";

export default async function MyCoursesPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khóa học của tôi"
        description="Quản lý và theo dõi tiến độ các khóa học bạn đã đăng ký"
      />

      <Suspense fallback={<Loading text="Đang tải khóa học..." />}>
        <MyCoursesContainer />
      </Suspense>
    </div>
  );
}
