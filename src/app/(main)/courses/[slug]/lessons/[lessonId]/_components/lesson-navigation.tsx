"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  List,
  Clock,
} from "lucide-react";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { useCourseBySlug } from "@/hooks/courses/use-course-by-slug";
import { useMyLessonProgress } from "@/hooks/lesson-progress/use-my-lesson-progress";
import { formatDuration } from "@/constants/labels";

interface LessonNavigationProps {
  courseSlug: string;
  currentLessonId: string;
}

export default function LessonNavigation({
  courseSlug,
  currentLessonId,
}: LessonNavigationProps) {
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
              <div key={i} className="h-12 bg-muted rounded"></div>
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
            <List className="h-5 w-5" />
            <span>Danh sách bài học</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Chưa có bài học nào</p>
        </CardContent>
      </Card>
    );
  }

  // Find current lesson index for navigation
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.id === currentLessonId
  );
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Calculate course progress
  const totalLessons = lessons.length;

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Điều hướng</h3>
            <Badge variant="outline">
              {currentIndex + 1}/{totalLessons}
            </Badge>
          </div>

          <div className="flex space-x-2">
            {previousLesson ? (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link
                  href={`/courses/${courseSlug}/lessons/${previousLesson.id}`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Bài trước
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Bài trước
              </Button>
            )}

            {nextLesson ? (
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link href={`/courses/${courseSlug}/lessons/${nextLesson.id}`}>
                  Bài tiếp
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button variant="default" size="sm" className="flex-1" disabled>
                Bài tiếp
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lesson List */}
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <List className="h-5 w-5" />
            <span>Danh sách bài học</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                {lessons?.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    courseSlug={courseSlug}
                    isActive={lesson.id === currentLessonId}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    order_index: number;
    duration_seconds: number | null;
  };
  courseSlug: string;
  isActive: boolean;
}

function LessonItem({ lesson, courseSlug, isActive }: LessonItemProps) {
  const { data: progressArray } = useMyLessonProgress({ lesson_id: lesson.id });

  // Get the latest progress record
  const progress = progressArray?.[0];

  const isCompleted = progress && progress.completed_at != null;
  const isLocked = false; // Would implement based on course access rules

  const watchedSeconds = progress?.watched_seconds || 0;
  const totalSeconds = lesson.duration_seconds || 0;
  const progressPercentage =
    totalSeconds > 0 ? (watchedSeconds / totalSeconds) * 100 : 0;

  const LessonLink = ({ children }: { children: React.ReactNode }) => {
    if (isLocked) {
      return <div className="block w-full">{children}</div>;
    }

    return (
      <Link
        href={`/courses/${courseSlug}/lessons/${lesson.id}`}
        className="block w-full"
      >
        {children}
      </Link>
    );
  };

  return (
    <LessonLink>
      <div
        className={`p-3 rounded-lg border transition-all hover:bg-accent/50 ${
          isActive
            ? "bg-primary/10 border-primary"
            : isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-background border-border hover:border-border/80"
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isLocked ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Play className="h-4 w-4 text-blue-600" />
            )}
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`text-sm font-medium line-clamp-2 ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {lesson.order_index}. {lesson.title}
                </h4>

                {lesson.duration_seconds && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(lesson.duration_seconds)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Badge */}
              {progressPercentage > 0 && !isCompleted && (
                <Badge variant="outline" className="text-xs ml-2">
                  {Math.round(progressPercentage)}%
                </Badge>
              )}

              {isCompleted && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs ml-2"
                >
                  Hoàn thành
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            {progressPercentage > 0 && !isCompleted && (
              <div className="mt-2">
                <div className="w-full h-1 bg-muted rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LessonLink>
  );
}
