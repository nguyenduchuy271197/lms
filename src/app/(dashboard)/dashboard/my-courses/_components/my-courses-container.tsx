"use client";

import { useState } from "react";
import { useMyEnrollments } from "@/hooks/enrollments/use-my-enrollments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EnrollmentStatus } from "@/types/custom.types";
import MyCourseCard from "./my-course-card";
import MyCoursesSkeletonList from "./my-courses-skeleton-list";

export default function MyCoursesContainer() {
  const [activeTab, setActiveTab] = useState<EnrollmentStatus | "all">("all");

  const {
    data: enrollments,
    isLoading,
    error,
  } = useMyEnrollments({
    status: activeTab === "all" ? undefined : activeTab,
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

  const activeCourses = enrollments?.filter((e) => e.status === "active") || [];
  const completedCourses =
    enrollments?.filter((e) => e.status === "completed") || [];
  const droppedCourses =
    enrollments?.filter((e) => e.status === "dropped") || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang học</CardTitle>
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              {activeCourses.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              khóa học đang tiến hành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {completedCourses.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              khóa học đã hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cộng</CardTitle>
            <Badge variant="outline">{enrollments?.length || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              tổng số khóa học đã đăng ký
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as EnrollmentStatus | "all")
        }
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Tất cả ({enrollments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Đang học ({activeCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Hoàn thành ({completedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="dropped">
            Đã bỏ ({droppedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
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
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
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
                  <p>Không có khóa học đang học</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((enrollment) => (
                <MyCourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Chưa có khóa học hoàn thành</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dropped" className="space-y-4 mt-6">
          {droppedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {droppedCourses.map((enrollment) => (
                <MyCourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Không có khóa học đã bỏ</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
