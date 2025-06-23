import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import CourseManagementContainer from "./_components/course-management-container";

export const metadata: Metadata = {
  title: "Quản lý khóa học",
  description: "Quản lý danh sách khóa học của hệ thống",
};

export default async function CourseManagementPage() {
  // Require admin authentication
  await requireAdmin();

  return (
    <div>
      <CourseManagementContainer />
    </div>
  );
}
