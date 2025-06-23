import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCourseBySlug } from "@/actions/courses/get-course-by-slug";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import CourseProgressOverview from "./_components/course-progress-overview";
import CourseProgressStats from "./_components/course-progress-stats";
import CourseProgressLessons from "./_components/course-progress-lessons";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CourseProgressPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CourseProgressPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await getCourseBySlug({ slug });

    if (!result.success) {
      return {
        title: "Khóa học không tìm thấy",
      };
    }

    const course = result.data;

    return {
      title: `Tiến độ - ${course.title}`,
      description: `Theo dõi tiến độ học tập khóa học ${course.title}`,
    };
  } catch {
    return {
      title: "Khóa học không tìm thấy",
    };
  }
}

export default async function CourseProgressPage({
  params,
}: CourseProgressPageProps) {
  await requireAuth();

  const { slug } = await params;

  // Fetch course data
  const result = await getCourseBySlug({ slug });

  if (!result.success) {
    notFound();
  }

  const course = result.data;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/courses/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại khóa học
          </Link>
        </Button>

        <PageHeader
          title={`Tiến độ học tập`}
          description={`Theo dõi tiến độ của bạn trong khóa học "${course.title}"`}
        />
      </div>

      <div className="space-y-6">
        {/* Progress Overview */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          }
        >
          <CourseProgressStats courseId={course.id} />
        </Suspense>

        {/* Detailed Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <div className="h-96 bg-muted rounded-lg animate-pulse" />
              }
            >
              <CourseProgressOverview courseId={course.id} courseSlug={slug} />
            </Suspense>
          </div>

          {/* Lessons Progress */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="h-96 bg-muted rounded-lg animate-pulse" />
              }
            >
              <CourseProgressLessons courseSlug={slug} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
