import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Users, BookOpen, TrendingUp, Star } from "lucide-react";
import { AdminDashboardStats } from "@/actions/dashboard/get-admin-stats";

interface CategoryPerformanceChartProps {
  data?: AdminDashboardStats;
  isLoading: boolean;
}

export default function CategoryPerformanceChart({
  data,
  isLoading,
}: CategoryPerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
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

  if (!data?.category_performance || data.category_performance.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Không có dữ liệu danh mục để hiển thị
        </p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatPercent = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return "0.0%";
    return `${num.toFixed(1)}%`;
  };

  const getPopularityLevel = (
    enrollmentCount: number,
    maxEnrollment: number
  ) => {
    const percentage =
      maxEnrollment > 0 ? (enrollmentCount / maxEnrollment) * 100 : 0;
    if (percentage >= 80)
      return {
        level: "Rất phổ biến",
        color: "text-green-600",
        variant: "default" as const,
      };
    if (percentage >= 60)
      return {
        level: "Phổ biến",
        color: "text-blue-600",
        variant: "secondary" as const,
      };
    if (percentage >= 40)
      return {
        level: "Trung bình",
        color: "text-yellow-600",
        variant: "outline" as const,
      };
    return {
      level: "Ít phổ biến",
      color: "text-gray-600",
      variant: "outline" as const,
    };
  };

  const categories = data.category_performance.slice(0, 8);
  const maxEnrollment =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.total_enrollments))
      : 0;

  const totalEnrollments = categories.reduce(
    (sum, c) => sum + c.total_enrollments,
    0
  );
  const totalCourses = categories.reduce((sum, c) => sum + c.total_courses, 0);

  return (
    <div className="space-y-6">
      {/* Popular Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Danh mục phổ biến
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const popularityInfo = getPopularityLevel(
                category.total_enrollments,
                maxEnrollment
              );
              const enrollmentPercentage =
                totalEnrollments > 0
                  ? (category.total_enrollments / totalEnrollments) * 100
                  : 0;

              return (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium">
                          {category.category_name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {formatNumber(category.total_enrollments)} lượt ghi
                          danh
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {category.total_courses} khóa học
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={popularityInfo.variant}
                      className={popularityInfo.color}
                    >
                      {popularityInfo.level}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tỷ lệ ghi danh</span>
                      <span className="font-medium">
                        {formatPercent(enrollmentPercentage)}
                      </span>
                    </div>
                    <Progress value={enrollmentPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Tỷ lệ hoàn thành
                      </span>
                      <div className="font-medium">
                        {formatPercent(category.avg_completion_rate || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TB/khóa học</span>
                      <div className="font-medium">
                        {category.total_courses > 0
                          ? Math.round(
                              category.total_enrollments /
                                category.total_courses
                            )
                          : 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Xếp hạng</span>
                      <div className="font-medium">#{index + 1}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Danh mục phổ biến nhất
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng lượt ghi danh
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalEnrollments)}
            </div>
            <p className="text-xs text-muted-foreground">Từ top danh mục</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalCourses)}
            </div>
            <p className="text-xs text-muted-foreground">Từ top danh mục</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              TB ghi danh/danh mục
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                categories.length > 0
                  ? Math.round(totalEnrollments / categories.length)
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Lượt ghi danh trung bình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Category Insight */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Danh mục hàng đầu: {categories[0].category_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatNumber(categories[0].total_enrollments)}
                </div>
                <p className="text-sm text-muted-foreground">Lượt ghi danh</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {categories[0].total_courses}
                </div>
                <p className="text-sm text-muted-foreground">Khóa học</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatPercent(categories[0].avg_completion_rate || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tỷ lệ hoàn thành
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
