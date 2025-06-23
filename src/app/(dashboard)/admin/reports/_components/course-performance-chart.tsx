import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { AdminDashboardStats } from "@/actions/dashboard/get-admin-stats";

interface CoursePerformanceChartProps {
  data?: AdminDashboardStats;
  isLoading: boolean;
}

export default function CoursePerformanceChart({
  data,
  isLoading,
}: CoursePerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.top_courses || data.top_courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Không có dữ liệu khóa học để hiển thị
        </p>
      </div>
    );
  }

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionBadgeVariant = (rate: number) => {
    if (rate >= 80) return "default";
    if (rate >= 60) return "secondary";
    return "outline";
  };

  const topCourses = data.top_courses.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Performing Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Khóa học hiệu suất cao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium line-clamp-2">{course.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {formatNumber(course.enrollment_count)} học viên
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.category_name}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={getCompletionBadgeVariant(course.completion_rate)}
                  >
                    {formatPercent(course.completion_rate)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tỷ lệ hoàn thành</span>
                    <span
                      className={`font-medium ${getCompletionColor(
                        course.completion_rate
                      )}`}
                    >
                      {formatPercent(course.completion_rate)}
                    </span>
                  </div>
                  <Progress value={course.completion_rate} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Tiến độ trung bình
                    </span>
                    <div className="font-medium">
                      {formatPercent(course.avg_progress)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tiến độ TB</span>
                    <div className="font-medium">
                      {Math.round(course.avg_progress)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Khóa học hiệu quả
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCourses.filter((c) => c.completion_rate >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ hoàn thành ≥ 80%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ hoàn thành TB
            </CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(
                topCourses.reduce((sum, c) => sum + c.completion_rate, 0) /
                  topCourses.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Của top 10 khóa học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng lượt ghi danh
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                topCourses.reduce((sum, c) => sum + c.enrollment_count, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Từ top 10 khóa học</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
