"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Play, BookOpen, TrendingUp } from "lucide-react";
import { Lesson } from "@/types/custom.types";
import { useMyLessonProgress } from "@/hooks/lesson-progress/use-my-lesson-progress";
import { useMarkLessonComplete } from "@/hooks/lesson-progress/use-mark-lesson-complete";
import { formatDuration } from "@/constants/labels";

interface LessonProgressProps {
  lesson: Lesson;
}

export default function LessonProgress({ lesson }: LessonProgressProps) {
  const { data: progressArray, isLoading } = useMyLessonProgress({
    lesson_id: lesson.id,
  });

  // Get the latest progress record
  const progress = progressArray?.[0];

  const markCompleteMutation = useMarkLessonComplete();

  const handleMarkComplete = async () => {
    try {
      await markCompleteMutation.mutateAsync({
        lesson_id: lesson.id,
        watched_seconds: lesson.duration_seconds || 0,
      });
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const watchedSeconds = progress?.watched_seconds || 0;
  const totalSeconds = lesson.duration_seconds || 0;
  const progressPercentage =
    totalSeconds > 0 ? (watchedSeconds / totalSeconds) * 100 : 0;
  const isCompleted = progress?.completed_at !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Tiến độ bài học</span>
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Hoàn thành
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiến độ xem</span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDuration(watchedSeconds)}</span>
            <span>{formatDuration(totalSeconds)}</span>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium">{formatDuration(watchedSeconds)}</p>
              <p className="text-muted-foreground text-xs">Đã xem</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium">{Math.round(progressPercentage)}%</p>
              <p className="text-muted-foreground text-xs">Hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Progress Status */}
        <div className="space-y-2">
          {isCompleted ? (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Bài học đã hoàn thành</span>
            </div>
          ) : progressPercentage > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">Đang học</span>
              </div>

              {/* Manual Complete Button */}
              {progressPercentage >= 80 && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={markCompleteMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {markCompleteMutation.isPending
                    ? "Đang xử lý..."
                    : "Đánh dấu hoàn thành"}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-3">
              Chưa bắt đầu xem bài học
            </div>
          )}
        </div>

        {/* Completion Date */}
        {isCompleted && progress?.completed_at && (
          <div className="text-xs text-muted-foreground">
            Hoàn thành:{" "}
            {new Date(progress.completed_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t space-y-2">
          <div className="text-xs text-muted-foreground">
            Mẹo: Video sẽ tự động được đánh dấu hoàn thành khi bạn xem hết 90%
            nội dung
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
