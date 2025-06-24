"use client";

import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Lock, TrendingUp } from "lucide-react";
import { formatDuration } from "@/constants/labels";
import Link from "next/link";

interface CourseLessonsProps {
  courseId: string;
  courseSlug: string;
  userId?: string;
}

export default function CourseLessons({
  courseId,
  courseSlug,
  userId,
}: CourseLessonsProps) {
  const {
    data: lessons = [],
    isLoading,
    error,
  } = useLessonsByCourse({ course_id: courseId });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nội dung khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-gray-200 rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nội dung khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Không thể tải danh sách bài học</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nội dung khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có bài học nào</p>
            <p className="text-sm mt-1">Khóa học đang được cập nhật nội dung</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDuration = lessons.reduce(
    (total, lesson) => total + (lesson.duration_seconds || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Nội dung khóa học</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {lessons.length} bài học • {formatDuration(totalDuration)}
            </div>
            {userId && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/courses/${courseSlug}/progress`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Xem tiến độ
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={
                lesson.is_published
                  ? `/courses/${courseSlug}/lessons/${lesson.id}`
                  : "#"
              }
              className={`group flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow ${
                lesson.is_published
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              {/* Lesson Icon */}
              <div className="flex-shrink-0">
                {lesson.is_published ? (
                  <PlayCircle className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                ) : (
                  <Lock className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Lesson Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                    {index + 1}. {lesson.title}
                  </h4>
                  {!lesson.is_published && (
                    <Badge variant="secondary" className="text-xs">
                      Chưa xuất bản
                    </Badge>
                  )}
                </div>

                {lesson.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {lesson.duration_seconds
                        ? formatDuration(lesson.duration_seconds)
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{lesson.lesson_type}</span>
                  </div>
                </div>
              </div>

              {/* Lesson Status/Action */}
              <div className="flex-shrink-0">
                {lesson.is_published ? (
                  <div className="text-xs text-gray-500">Nhấn để xem</div>
                ) : (
                  <div className="text-xs text-gray-400">Sắp ra mắt</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
