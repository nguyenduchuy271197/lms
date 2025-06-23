"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { useAdminStats } from "@/hooks/dashboard/use-admin-stats";
import { formatNumber, formatPercent } from "@/lib/utils";

export function AdminStatsContainer() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return <AdminStatsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không thể tải dữ liệu thống kê</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Tổng học viên",
      value: formatNumber(stats.overview.total_students),
      description: `+${formatNumber(
        stats.trends.new_students_this_period || 0
      )} trong kỳ`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Khóa học",
      value: formatNumber(stats.overview.total_courses),
      description: `${formatNumber(stats.overview.total_lessons)} bài học`,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Lượt ghi danh",
      value: formatNumber(stats.overview.total_enrollments),
      description: `${formatNumber(
        stats.overview.active_enrollments
      )} đang hoạt động`,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: formatPercent(stats.overview.avg_completion_rate || 0),
      description: "Trung bình toàn hệ thống",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Hoàn thành",
      value: formatNumber(stats.overview.completed_enrollments || 0),
      description: "Khóa học đã hoàn thành",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Thời gian học",
      value: `${formatNumber(
        Math.round(stats.overview.total_watch_time_hours || 0)
      )}h`,
      description: "Tổng thời gian học",
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {formatNumber(stats.trends.new_students_this_period || 0)} học
                  viên mới đăng ký
                </p>
                <p className="text-xs text-muted-foreground">Trong kỳ này</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {formatNumber(stats.overview.total_courses)} khóa học đang
                  hoạt động
                </p>
                <p className="text-xs text-muted-foreground">
                  Với {formatNumber(stats.overview.total_lessons)} bài học
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {formatNumber(stats.trends.new_enrollments_this_period || 0)}{" "}
                  lượt ghi danh mới
                </p>
                <p className="text-xs text-muted-foreground">
                  Tỷ lệ hoàn thành{" "}
                  {formatPercent(stats.overview.avg_completion_rate || 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminStatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1 animate-pulse" />
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
