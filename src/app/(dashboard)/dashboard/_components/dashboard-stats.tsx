"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, Clock, Trophy } from "lucide-react";
import { useMyEnrollments } from "@/hooks/enrollments/use-my-enrollments";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/constants/labels";

interface DashboardStats {
  totalEnrolled: number;
  completedCourses: number;
  totalWatchTime: number;
  averageProgress: number;
}

export default function DashboardStats() {
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    completedCourses: 0,
    totalWatchTime: 0,
    averageProgress: 0,
  });

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Get user's enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments(
    {
      enabled: !!userId,
    }
  );

  // Calculate stats from enrollments
  useEffect(() => {
    if (enrollments) {
      const totalEnrolled = enrollments.length;
      const completedCourses = enrollments.filter(
        (e) => e.status === "completed"
      ).length;

      // TODO: Implement actual watch time calculation from lesson progress
      // For now, we'll use a placeholder
      const totalWatchTime = 0;

      // Calculate average progress - would need course progress data
      const averageProgress =
        completedCourses > 0 ? (completedCourses / totalEnrolled) * 100 : 0;

      setStats({
        totalEnrolled,
        completedCourses,
        totalWatchTime,
        averageProgress,
      });
    }
  }, [enrollments]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Khóa học đã đăng ký
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
          )}
          <p className="text-xs text-muted-foreground">
            {stats.totalEnrolled > 0
              ? "Tiếp tục học tập"
              : "Bắt đầu học tập ngay"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Khóa học hoàn thành
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          )}
          <p className="text-xs text-muted-foreground">
            {stats.completedCourses > 0
              ? `${stats.completedCourses}/${stats.totalEnrolled} hoàn thành`
              : "Chưa hoàn thành khóa học nào"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thời gian học</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">
              {stats.totalWatchTime > 0
                ? formatDuration(stats.totalWatchTime)
                : "0h"}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Tổng thời gian đã học</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tiến độ trung bình
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="text-2xl font-bold">
              {stats.averageProgress > 0
                ? `${Math.round(stats.averageProgress)}%`
                : "--"}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {stats.totalEnrolled > 0 ? "Tiến độ hoàn thành" : "Chưa có dữ liệu"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
