import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
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
    <div className="container mx-auto py-6">
      <LessonManagementContainer courseId={courseId} />
    </div>
  );
}
