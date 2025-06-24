"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle, Calendar } from "lucide-react";
import { EnrollmentWithDetails } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";

interface MyCourseCardProps {
  enrollment: EnrollmentWithDetails;
}

export default function MyCourseCard({ enrollment }: MyCourseCardProps) {
  const course = enrollment.courses;

  // Get lessons to find next lesson to learn
  const { data: lessons } = useLessonsByCourse(
    { course_id: course?.id || "" },
    { enabled: !!course?.id }
  );

  if (!course) {
    return null;
  }

  // Helper function to get the best lesson to continue from
  const getContinueLessonId = () => {
    if (!lessons || lessons.length === 0) return null;

    // Find first published lesson - simplified for now
    // TODO: In the future, find the first incomplete lesson
    const firstPublishedLesson = lessons.find((lesson) => lesson.is_published);
    return firstPublishedLesson?.id || null;
  };

  const getStatusBadge = () => {
    switch (enrollment.status) {
      case "active":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <Play className="w-3 h-3 mr-1" />
            {LABELS.ENROLLMENT_STATUS.active}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {LABELS.ENROLLMENT_STATUS.completed}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    // Get the appropriate lesson to continue from
    const lessonId = getContinueLessonId();
    const continueHref = lessonId
      ? `/courses/${course.slug}/lessons/${lessonId}`
      : `/courses/${course.slug}`;

    switch (enrollment.status) {
      case "active":
        return (
          <Button asChild size="sm" className="w-full">
            <Link href={continueHref}>
              <Play className="w-4 h-4 mr-2" />
              Tiếp tục học
            </Link>
          </Button>
        );
      case "completed":
        return (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={continueHref}>
              <BookOpen className="w-4 h-4 mr-2" />
              Xem lại
            </Link>
          </Button>
        );
      default:
        return null;
    }
  };

  const enrolledDate = new Date(enrollment.enrolled_at).toLocaleDateString(
    "vi-VN"
  );
  const completedDate = enrollment.completed_at
    ? new Date(enrollment.completed_at).toLocaleDateString("vi-VN")
    : null;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Image */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/courses/${course.slug}`}>{course.title}</Link>
          </h3>

          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Category */}
          {course.categories && (
            <Badge variant="outline" className="text-xs">
              {course.categories.name}
            </Badge>
          )}
        </div>

        {/* Progress - TODO: Implement progress tracking */}
        {enrollment.status === "active" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <span>0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Đăng ký: {enrolledDate}</span>
          </div>
          {completedDate && (
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Hoàn thành: {completedDate}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">{getActionButton()}</CardFooter>
    </Card>
  );
}
