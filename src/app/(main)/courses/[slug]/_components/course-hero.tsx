import { Course } from "@/types/custom.types";

import { BookOpen, Clock, Users, Star } from "lucide-react";
import Image from "next/image";

interface CourseHeroProps {
  course: Course;
}

export default function CourseHero({ course }: CourseHeroProps) {
  const { title, description, thumbnail_url } = course;

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
