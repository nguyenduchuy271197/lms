import { Course } from "@/types/custom.types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
  viewMode?: "grid" | "list";
}

export default function CourseCard({
  course,
  viewMode = "grid",
}: CourseCardProps) {
  const { title, description, thumbnail_url, slug } = course;

  if (viewMode === "list") {
    return (
      <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative w-full sm:w-48 h-48 sm:h-32">
          {thumbnail_url ? (
            <Image
              src={thumbnail_url}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600">
                  <Link href={`/courses/${slug}`}>{title}</Link>
                </h3>
              </div>

              {description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>0 bài học</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>0 học viên</span>
                </div>
              </div>

              <Button size="sm" asChild>
                <Link href={`/courses/${slug}`}>Xem chi tiết</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {thumbnail_url ? (
          <Image
            src={thumbnail_url}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600">
          <Link href={`/courses/${slug}`}>{title}</Link>
        </h3>

        {description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>0 bài học</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>0h 0m</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>0 học viên</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/courses/${slug}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
