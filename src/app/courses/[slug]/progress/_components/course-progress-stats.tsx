"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Calendar } from "lucide-react";
import { useCourseProgress } from "@/hooks/lesson-progress/use-course-progress";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CourseProgressStatsProps {
  courseId: string;
}

export default function CourseProgressStats({
  courseId,
}: CourseProgressStatsProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUserId();
  }, []);

  const { data: progress, isLoading } = useCourseProgress(
    { course_id: courseId, student_id: userId || "" },
    !!userId
  );

  if (isLoading || !userId) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-8"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-2 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Chưa có dữ liệu tiến độ</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage =
    progress.total_lessons > 0
      ? (progress.completed_lessons / progress.total_lessons) * 100
      : 0;

  // Days since enrollment
  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(progress.enrolled_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const stats = [
    {
      title: "Tiến độ hoàn thành",
      value: `${Math.round(completionPercentage)}%`,
      subtitle: `${progress.completed_lessons}/${progress.total_lessons} bài học`,
      icon: Target,
      color: "text-green-600",
      progress: completionPercentage,
      progressColor: "bg-green-500",
    },
    {
      title: "Trạng thái",
      value:
        progress.enrollment_status === "completed" ? "Hoàn thành" : "Đang học",
      subtitle: `Đăng ký từ ${new Date(progress.enrolled_at).toLocaleDateString(
        "vi-VN"
      )}`,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Hoạt động học tập",
      value: `${daysSinceStart} ngày`,
      subtitle: progress.last_watched_at
        ? `Học gần nhất: ${new Date(
            progress.last_watched_at
          ).toLocaleDateString("vi-VN")}`
        : "Chưa có hoạt động",
      icon: Calendar,
      color: "text-purple-600",
      badge:
        progress.last_watched_at &&
        new Date().getTime() - new Date(progress.last_watched_at).getTime() <
          24 * 60 * 60 * 1000
          ? "Hoạt động hôm nay"
          : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                {stat.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>

              {stat.progress !== undefined && (
                <div className="space-y-1">
                  <Progress value={stat.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Decorative gradient */}
          <div
            className={`absolute top-0 right-0 w-1 h-full ${
              stat.color.includes("green")
                ? "bg-green-500"
                : stat.color.includes("blue")
                ? "bg-blue-500"
                : "bg-purple-500"
            } opacity-20`}
          />
        </Card>
      ))}
    </div>
  );
}
