import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/actions/courses/get-course-by-slug";
import { getCurrentUserId } from "@/lib/auth";
import CourseHero from "./_components/course-hero";
import CourseContent from "./_components/course-content";
import CourseLessons from "./_components/course-lessons";
import CourseEnrollment from "./_components/course-enrollment";
import { Loader2 } from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCourseBySlug({ slug });

  if (!result.success) {
    return {
      title: "Khóa học không tìm thấy | LMS",
      description: "Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }

  const course = result.data;

  return {
    title: `${course.title} | LMS`,
    description: course.description || `Tìm hiểu về khóa học ${course.title}`,
    openGraph: {
      title: course.title,
      description: course.description || undefined,
      images: course.thumbnail_url ? [course.thumbnail_url] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;

  // Fetch course data and user info server-side
  const [result, userId] = await Promise.all([
    getCourseBySlug({ slug }),
    getCurrentUserId(),
  ]);

  if (!result.success) {
    notFound();
  }

  const course = result.data;

  return (
    <div className="min-h-screen">
      {/* Course Hero Section */}
      <CourseHero course={course} />

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description and Objectives */}
            <CourseContent course={course} />

            {/* Course Lessons */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Đang tải danh sách bài học...</span>
                </div>
              }
            >
              <CourseLessons courseId={course.id} courseSlug={course.slug} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Suspense
                fallback={
                  <div className="h-64 animate-pulse bg-gray-200 rounded-lg" />
                }
              >
                <CourseEnrollment
                  course={course}
                  userId={userId || undefined}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
