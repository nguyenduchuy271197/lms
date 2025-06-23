import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Award,
} from "lucide-react";
import { AdminDashboardStats } from "@/actions/dashboard/get-admin-stats";

interface OverviewCardsProps {
  data?: AdminDashboardStats;
  isLoading: boolean;
}

export default function OverviewCards({ data, isLoading }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const cards = [
    {
      title: "Tổng học viên",
      value: formatNumber(data.overview.total_students),
      trend: data.trends?.growth_rate_students || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Tổng khóa học",
      value: formatNumber(data.overview.total_courses),
      trend: 0, // No courses growth in trends
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Lượt ghi danh",
      value: formatNumber(data.overview.total_enrollments),
      trend: data.trends?.growth_rate_enrollments || 0,
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: formatPercent(data.overview.avg_completion_rate),
      trend: 0, // No completion rate change in trends
      icon: Award,
      color: "text-orange-600",
    },
    {
      title: "Học viên hoạt động",
      value: formatNumber(data.overview.active_enrollments),
      description: "Hoạt động trong 30 ngày",
      icon: Users,
      color: "text-emerald-600",
    },
    {
      title: "Thời gian học TB",
      value: `${Math.round(data.overview.total_watch_time_hours)} giờ`,
      description: "Mỗi phiên học",
      icon: Clock,
      color: "text-indigo-600",
    },
    {
      title: "Tổng lượt xem",
      value: formatNumber(data.overview.total_lessons),
      description: "Video được xem",
      icon: Eye,
      color: "text-pink-600",
    },
    {
      title: "Danh mục phổ biến",
      value: data.category_performance?.[0]?.category_name || "N/A",
      description: `${
        data.category_performance?.[0]?.total_enrollments || 0
      } lượt ghi danh`,
      icon: BookOpen,
      color: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.trend !== undefined ? (
                <div
                  className={`flex items-center text-xs ${getTrendColor(
                    card.trend
                  )}`}
                >
                  {getTrendIcon(card.trend)}
                  <span className="ml-1">
                    {card.trend > 0 ? "+" : ""}
                    {formatPercent(card.trend)} từ kỳ trước
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Cards */}
      {data.top_courses && data.top_courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiến độ khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_courses.slice(0, 5).map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course.title}</span>
                    <Badge variant="secondary">
                      {formatPercent(course.completion_rate)}
                    </Badge>
                  </div>
                  <Progress value={course.completion_rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
