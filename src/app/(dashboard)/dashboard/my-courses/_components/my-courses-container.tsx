"use client";

import { useMyEnrollments } from "@/hooks/enrollments/use-my-enrollments";
import { Card, CardContent } from "@/components/ui/card";
import MyCourseCard from "./my-course-card";
import MyCoursesSkeletonList from "./my-courses-skeleton-list";

export default function MyCoursesContainer() {
  const {
    data: enrollments,
    isLoading,
    error,
  } = useMyEnrollments({
    enabled: true,
  });

  if (isLoading) {
    return <MyCoursesSkeletonList />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Có lỗi xảy ra khi tải danh sách khóa học</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show active and completed courses
  const activeCourses =
    enrollments?.filter(
      (e) => e.status === "active" || e.status === "completed"
    ) || [];

  return (
    <div className="space-y-6">
      {activeCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCourses.map((enrollment) => (
            <MyCourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Bạn chưa đăng ký khóa học nào</p>
              <p className="text-sm mt-1">
                Hãy khám phá và đăng ký các khóa học thú vị!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
