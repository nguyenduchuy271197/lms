"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  CheckCircle,
  Play,
  Clock,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { useCourseBySlug } from "@/hooks/courses/use-course-by-slug";
import { useMyLessonProgress } from "@/hooks/lesson-progress/use-my-lesson-progress";
import { formatDuration } from "@/constants/labels";
import Link from "next/link";

interface CourseProgressLessonsProps {
  courseSlug: string;
}

export default function CourseProgressLessons({
  courseSlug,
}: CourseProgressLessonsProps) {
  // First get course by slug to get course_id
  const { data: course, isLoading: isCourseLoading } = useCourseBySlug({
    slug: courseSlug,
  });

  // Then get lessons by course_id
  const { data: lessons, isLoading: isLessonsLoading } = useLessonsByCourse(
    {
      course_id: course?.id || "",
    },
    {
      enabled: !!course?.id,
    }
  );

  const isLoading = isCourseLoading || isLessonsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Tiến độ bài học</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            Chưa có bài học nào
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedLessons = 0; // Placeholder - would need actual progress data

  const progressPercentage = (completedLessons / lessons.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Tiến độ bài học</span>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedLessons}/{lessons.length} bài học hoàn thành
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {lessons.map((lesson, index) => (
              <LessonProgressItem
                key={lesson.id}
                lesson={lesson}
                courseSlug={courseSlug}
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface LessonProgressItemProps {
  lesson: {
    id: string;
    title: string;
    order_index: number;
    duration_seconds: number | null;
  };
  courseSlug: string;
  index: number;
}

function LessonProgressItem({
  lesson,
  courseSlug,
  index,
}: LessonProgressItemProps) {
  const { data: progressArray } = useMyLessonProgress({
    lesson_id: lesson.id,
  });

  // Get the latest progress record
  const progress = progressArray?.[0];

  const isCompleted = progress?.completed_at !== null;
  const watchedSeconds = progress?.watched_seconds || 0;
  const totalSeconds = lesson.duration_seconds || 0;
  const progressPercentage =
    totalSeconds > 0 ? (watchedSeconds / totalSeconds) * 100 : 0;

  // Simple access logic - first lesson always available, others after previous is completed
  const isAccessible = index === 0 || true; // Simplified for now
  const isLocked = !isAccessible;

  const getStatusIcon = () => {
    if (isLocked) return <Lock className="h-4 w-4 text-muted-foreground" />;
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (progressPercentage > 0)
      return <Play className="h-4 w-4 text-blue-600" />;
    return <Play className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (isLocked)
      return (
        <Badge variant="outline" className="text-xs">
          Khóa
        </Badge>
      );
    if (isCompleted)
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 text-xs"
        >
          Hoàn thành
        </Badge>
      );
    if (progressPercentage > 0)
      return (
        <Badge variant="outline" className="text-xs">
          {Math.round(progressPercentage)}%
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs">
        Chưa học
      </Badge>
    );
  };

  const LessonWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isLocked) {
      return <div className="w-full">{children}</div>;
    }

    return (
      <Link
        href={`/courses/${courseSlug}/lessons/${lesson.id}`}
        className="w-full"
      >
        {children}
      </Link>
    );
  };

  return (
    <LessonWrapper>
      <div
        className={`p-3 rounded-lg border transition-all hover:bg-accent/50 ${
          isCompleted
            ? "bg-green-50 border-green-200"
            : progressPercentage > 0
            ? "bg-blue-50 border-blue-200"
            : "bg-background border-border"
        } ${!isLocked ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
      >
        <div className="flex items-start space-x-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>

          {/* Lesson Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-2 mb-1">
                  {lesson.order_index}. {lesson.title}
                </h4>

                {lesson.duration_seconds && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(lesson.duration_seconds)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-2">
                {getStatusBadge()}
                {!isLocked && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Progress Bar for In-Progress Lessons */}
            {progressPercentage > 0 && !isCompleted && (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-muted rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(watchedSeconds)}</span>
                  <span>{formatDuration(totalSeconds)}</span>
                </div>
              </div>
            )}

            {/* Completion Info */}
            {isCompleted && progress?.completed_at && (
              <div className="text-xs text-green-600 mt-1">
                Hoàn thành:{" "}
                {new Date(progress.completed_at).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        </div>
      </div>
    </LessonWrapper>
  );
}
