"use client";

import { Course } from "@/types/custom.types";
import { BookOpen, Clock, Users } from "lucide-react";
import Image from "next/image";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { useEnrollmentsByCourse } from "@/hooks/enrollments/use-enrollments-by-course";
import { formatDuration } from "@/constants/labels";

interface CourseHeroProps {
  course: Course;
}

export default function CourseHero({ course }: CourseHeroProps) {
  const { title, description, thumbnail_url, id } = course;

  // Get lessons data
  const { data: lessons } = useLessonsByCourse({ course_id: id });

  // Get enrollments data
  const { data: enrollments } = useEnrollmentsByCourse({
    course_id: id,
    enabled: !!id,
  });

  // Calculate stats
  const publishedLessons =
    lessons?.filter((lesson) => lesson.is_published) || [];
  const totalLessons = publishedLessons.length;
  const totalDurationSeconds = publishedLessons.reduce(
    (sum, lesson) => sum + (lesson.duration_seconds || 0),
    0
  );
  const activeEnrollments =
    enrollments?.filter(
      (e) => e.status === "active" || e.status === "completed"
    ).length || 0;

  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          {/* Course Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span>Khóa học</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-lg text-blue-100 leading-relaxed">
                {description}
              </p>
            )}

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{totalLessons} bài học</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{formatDuration(totalDurationSeconds)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{activeEnrollments} học viên</span>
              </div>
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="relative">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
              {thumbnail_url ? (
                <Image
                  src={thumbnail_url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
