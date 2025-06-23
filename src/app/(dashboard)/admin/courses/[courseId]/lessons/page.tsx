import { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";
import LessonManagementContainer from "./_components/lesson-management-container";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export const metadata: Metadata = {
  title: "Quản lý bài học",
  description: "Quản lý bài học trong khóa học",
};

export default async function LessonManagementPage({ params }: PageProps) {
  // Require admin authentication
  await requireAdmin();
  const { courseId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý bài học"
        description="Tạo, chỉnh sửa và sắp xếp các bài học trong khóa học"
      />
      <Suspense fallback={<Loading text="Đang tải danh sách bài học..." />}>
        <LessonManagementContainer courseId={courseId} />
      </Suspense>
    </div>
  );
}
