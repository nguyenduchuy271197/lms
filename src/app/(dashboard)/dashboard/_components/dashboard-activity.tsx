"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Trophy } from "lucide-react";
import { useMyEnrollments } from "@/hooks/enrollments/use-my-enrollments";
import { createClient } from "@/lib/supabase/client";

export default function DashboardActivity() {
  const [userId, setUserId] = useState<string | null>(null);

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

  // Get recent enrollments for activity section
  const recentEnrollments = enrollments
    ?.sort(
      (a, b) =>
        new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Khóa học gần đây</CardTitle>
          <CardDescription>Các khóa học bạn đã đăng ký gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentEnrollments && recentEnrollments.length > 0 ? (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center space-x-3"
                >
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {enrollment.courses?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Đăng ký:{" "}
                      {new Date(enrollment.enrolled_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <div className="text-xs">
                    {enrollment.status === "completed" && (
                      <span className="text-green-600">Hoàn thành</span>
                    )}
                    {enrollment.status === "active" && (
                      <span className="text-blue-600">Đang học</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Chưa có khóa học nào được đăng ký
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động</CardTitle>
          <CardDescription>Lịch sử hoạt động học tập của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments
                .filter((e) => e.status === "completed")
                .slice(0, 3)
                .map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Hoàn thành khóa học</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {enrollment.completed_at
                        ? new Date(enrollment.completed_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </span>
                  </div>
                ))}

              {enrollments
                .filter((e) => e.status === "active")
                .slice(0, 2)
                .map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Đăng ký khóa học</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                ))}

              {enrollments.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Chưa có hoạt động nào
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Chưa có hoạt động nào
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
