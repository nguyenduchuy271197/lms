import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getLesson } from "@/actions/lessons/get-lesson";
import { getCourseBySlug } from "@/actions/courses/get-course-by-slug";
import { requireAuth } from "@/lib/auth";
import LessonVideo from "./_components/lesson-video";
import LessonNavigation from "./_components/lesson-navigation";
import { Loader2 } from "lucide-react";

interface LessonPageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;

  try {
    const result = await getLesson({ id: lessonId });

    if (!result.success) {
      return {
        title: "Bài học không tìm thấy",
      };
    }

    const lesson = result.data;

    return {
      title: `${lesson.title} - Học tập`,
      description: lesson.description || "Xem video bài học",
    };
  } catch {
    return {
      title: "Bài học không tìm thấy",
    };
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  await requireAuth();

  const { slug, lessonId } = await params;

  // Fetch lesson and course data
  const [lessonResult, courseResult] = await Promise.all([
    getLesson({ id: lessonId }),
    getCourseBySlug({ slug }),
  ]);

  if (!lessonResult.success || !courseResult.success) {
    notFound();
  }

  const lesson = lessonResult.data;
  const course = courseResult.data;

  // Verify lesson belongs to this course
  if (lesson.course_id !== course.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Course Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          <div className="text-sm text-muted-foreground">
            {course.title} • Bài học {lesson.order_index}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Area */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              <LessonVideo lesson={lesson} courseSlug={slug} />
            </Suspense>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="bg-muted rounded-lg h-64 animate-pulse" />
              }
            >
              <LessonNavigation courseSlug={slug} currentLessonId={lessonId} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
