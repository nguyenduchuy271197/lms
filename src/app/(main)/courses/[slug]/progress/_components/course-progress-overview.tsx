"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target, BookOpen, Award } from "lucide-react";
import { useCourseProgress } from "@/hooks/lesson-progress/use-course-progress";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { useCourseBySlug } from "@/hooks/courses/use-course-by-slug";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface CourseProgressOverviewProps {
  courseId: string;
  courseSlug: string;
}

export default function CourseProgressOverview({
  courseId,
  courseSlug,
}: CourseProgressOverviewProps) {
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

  const { data: progress, isLoading: progressLoading } = useCourseProgress(
    { course_id: courseId, student_id: userId || "" },
    !!userId
  );

  // Get course by slug to get course_id for lessons
  const { data: course, isLoading: isCourseLoading } = useCourseBySlug({
    slug: courseSlug,
  });

  const { data: lessons, isLoading: lessonsLoading } = useLessonsByCourse(
    {
      course_id: course?.id || "",
    },
    {
      enabled: !!course?.id,
    }
  );

  // Helper function to get the first available lesson
  const getFirstLessonId = () => {
    if (!lessons || lessons.length === 0) return null;
    const firstPublishedLesson = lessons.find((lesson) => lesson.is_published);
    return firstPublishedLesson?.id || lessons[0]?.id || null;
  };

  if (progressLoading || lessonsLoading || isCourseLoading || !userId) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress || !lessons) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Chưa có dữ liệu tiến độ</p>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage =
    progress.total_lessons > 0
      ? (progress.completed_lessons / progress.total_lessons) * 100
      : 0;

  // Learning milestones
  const milestones = [
    {
      threshold: 25,
      title: "Bắt đầu học",
      icon: BookOpen,
      achieved: completionPercentage >= 25,
      color: "text-blue-500",
    },
    {
      threshold: 50,
      title: "Nửa chặng đường",
      icon: Target,
      achieved: completionPercentage >= 50,
      color: "text-yellow-500",
    },
    {
      threshold: 75,
      title: "Gần hoàn thành",
      icon: TrendingUp,
      achieved: completionPercentage >= 75,
      color: "text-orange-500",
    },
    {
      threshold: 100,
      title: "Hoàn thành khóa học",
      icon: Award,
      achieved: completionPercentage >= 100,
      color: "text-green-500",
    },
  ];

  const nextMilestone = milestones.find((m) => !m.achieved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Tổng quan tiến độ</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {Math.round(completionPercentage)}% hoàn thành
              </h3>
              <p className="text-sm text-muted-foreground">
                {progress.completed_lessons} / {progress.total_lessons} bài học
              </p>
            </div>
            <Badge
              variant={completionPercentage === 100 ? "default" : "secondary"}
            >
              {completionPercentage === 100 ? "Hoàn thành" : "Đang học"}
            </Badge>
          </div>

          <Progress value={completionPercentage} className="h-3" />

          {nextMilestone && (
            <p className="text-sm text-muted-foreground">
              Hoàn thành thêm{" "}
              {nextMilestone.threshold - Math.round(completionPercentage)}% để
              đạt mốc &quot;{nextMilestone.title}&quot;
            </p>
          )}
        </div>

        {/* Learning Milestones */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Mốc học tập</h4>
          <div className="grid grid-cols-2 gap-3">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  milestone.achieved
                    ? "bg-green-50 border-green-200"
                    : "bg-muted/50 border-border"
                }`}
              >
                <milestone.icon
                  className={`h-4 w-4 ${
                    milestone.achieved
                      ? milestone.color
                      : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      milestone.achieved
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {milestone.threshold}%
                  </p>
                </div>
                {milestone.achieved && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    ✓
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Bài học</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {progress.completed_lessons}
            </p>
            <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Hoạt động</span>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {progress.last_watched_at
                ? Math.floor(
                    (new Date().getTime() -
                      new Date(progress.last_watched_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) === 0
                  ? "Hôm nay"
                  : `${Math.floor(
                      (new Date().getTime() -
                        new Date(progress.last_watched_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} ngày trước`
                : "Chưa học"}
            </p>
            <p className="text-xs text-muted-foreground">Học gần nhất</p>
          </div>
        </div>

        {/* Continue Learning Button */}
        <div className="pt-4 border-t">
          {completionPercentage < 100 ? (
            <Button asChild className="w-full">
              <Link
                href={
                  getFirstLessonId()
                    ? `/courses/${courseSlug}/lessons/${getFirstLessonId()}`
                    : `/courses/${courseSlug}`
                }
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Tiếp tục học
              </Link>
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Award className="h-5 w-5" />
                <span className="font-medium">
                  Chúc mừng! Bạn đã hoàn thành khóa học
                </span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link
                  href={
                    getFirstLessonId()
                      ? `/courses/${courseSlug}/lessons/${getFirstLessonId()}`
                      : `/courses/${courseSlug}`
                  }
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Xem lại khóa học
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
