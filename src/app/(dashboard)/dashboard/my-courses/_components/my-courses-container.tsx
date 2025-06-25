"use client";

import { useMyEnrollments } from "@/hooks/enrollments/use-my-enrollments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MyCourseCard from "./my-course-card";
import MyCoursesSkeletonList from "./my-courses-skeleton-list";
import Link from "next/link";
import { BookOpen } from "lucide-react";

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
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-muted-foreground">
                  Bạn chưa đăng ký khóa học nào
                </p>
                <p className="text-sm text-muted-foreground">
                  Hãy khám phá và đăng ký các khóa học thú vị để bắt đầu hành
                  trình học tập!
                </p>
              </div>
              <div className="pt-2">
                <Button asChild>
                  <Link href="/courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Khám phá khóa học
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
