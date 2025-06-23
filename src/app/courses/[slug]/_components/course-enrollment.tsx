"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  Clock,
  Play,
  CheckCircle,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Course } from "@/types/custom.types";
import { useCheckEnrollment } from "@/hooks/enrollments/use-check-enrollment";
import { useCreateEnrollment } from "@/hooks/enrollments/use-create-enrollment";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { toast } from "sonner";

interface CourseEnrollmentProps {
  course: Course;
  userId?: string;
}

export default function CourseEnrollment({
  course,
  userId,
}: CourseEnrollmentProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: enrollmentCheck, isLoading: checkingEnrollment } =
    useCheckEnrollment({
      course_id: course.id,
      enabled: !!userId,
    });

  // Get lessons to find first lesson
  const { data: lessons } = useLessonsByCourse({ course_id: course.id });

  const createEnrollmentMutation = useCreateEnrollment();

  // Helper function to get the first available lesson
  const getFirstLessonId = () => {
    if (!lessons || lessons.length === 0) return null;
    const firstPublishedLesson = lessons.find((lesson) => lesson.is_published);
    return firstPublishedLesson?.id || null;
  };

  const handleEnrollment = async () => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
      router.push("/login");
      return;
    }

    try {
      setIsEnrolling(true);
      await createEnrollmentMutation.mutateAsync({
        course_id: course.id,
      });

      // Redirect to first lesson or course page after enrollment
      const lessonId = getFirstLessonId();
      const redirectPath = lessonId
        ? `/courses/${course.slug}/lessons/${lessonId}`
        : `/courses/${course.slug}`;

      router.push(redirectPath);
    } catch {
      // Error handling is done in the mutation hook
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinueLearning = () => {
    const lessonId = getFirstLessonId();
    const redirectPath = lessonId
      ? `/courses/${course.slug}/lessons/${lessonId}`
      : `/courses/${course.slug}`;

    router.push(redirectPath);
  };

  const getEnrollmentButton = () => {
    if (!userId) {
      return (
        <Button onClick={handleEnrollment} className="w-full" size="lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Đăng nhập để đăng ký
        </Button>
      );
    }

    if (checkingEnrollment) {
      return (
        <Button disabled className="w-full" size="lg">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Đang kiểm tra...
        </Button>
      );
    }

    if (enrollmentCheck?.isEnrolled) {
      switch (enrollmentCheck.status) {
        case "active":
          return (
            <Button
              onClick={handleContinueLearning}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Tiếp tục học
            </Button>
          );
        case "completed":
          return (
            <Button
              onClick={handleContinueLearning}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Đã hoàn thành
            </Button>
          );
        case "dropped":
          return (
            <Button
              onClick={handleEnrollment}
              variant="outline"
              className="w-full"
              size="lg"
              disabled={isEnrolling || createEnrollmentMutation.isPending}
            >
              {isEnrolling || createEnrollmentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Học lại
            </Button>
          );
        default:
          return null;
      }
    }

    return (
      <Button
        onClick={handleEnrollment}
        className="w-full"
        size="lg"
        disabled={isEnrolling || createEnrollmentMutation.isPending}
      >
        {isEnrolling || createEnrollmentMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        Đăng ký khóa học
      </Button>
    );
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Thông tin khóa học
        </CardTitle>
        <CardDescription>Đăng ký để bắt đầu học ngay hôm nay</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enrollment Status */}
        {userId && enrollmentCheck?.isEnrolled && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trạng thái:</span>
              <Badge
                variant={
                  enrollmentCheck.status === "active"
                    ? "default"
                    : enrollmentCheck.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {enrollmentCheck.status === "active" && "Đang học"}
                {enrollmentCheck.status === "completed" && "Đã hoàn thành"}
                {enrollmentCheck.status === "dropped" && "Đã bỏ học"}
              </Badge>
            </div>
          </div>
        )}

        {/* Course Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              Học viên
            </span>
            <span className="font-medium">0</span>
          </div>

          <Separator />

          {/* TODO: Add lesson count when lessons are available */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              Bài học
            </span>
            <span className="font-medium">Sắp cập nhật</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              Thời lượng
            </span>
            <span className="font-medium">Sắp cập nhật</span>
          </div>
        </div>

        <Separator />

        {/* Enrollment Button */}
        {getEnrollmentButton()}

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Miễn phí • Truy cập trọn đời • Học theo tiến độ của bạn</p>
        </div>
      </CardContent>
    </Card>
  );
}
