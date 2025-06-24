import { Course } from "@/types/custom.types";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
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
      <Link href={`/courses/${slug}`} className="flex">
        <Card className="group flex flex-col sm:flex-row overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer py-0">
          <div className="relative w-full sm:w-48 h-48 sm:h-32 overflow-hidden">
            {thumbnail_url ? (
              <Image
                src={thumbnail_url}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>

          <CardContent className="flex-1 p-6">
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/courses/${slug}`}>
      <Card className="group overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full py-0 gap-2">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {thumbnail_url ? (
            <Image
              src={thumbnail_url}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Content */}
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
