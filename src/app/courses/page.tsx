import { Metadata } from "next";
import { Suspense } from "react";
import CourseGrid from "./_components/course-grid";
import CourseFilters from "./_components/course-filters";
import PageHeader from "@/components/shared/page-header";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Khóa học | LMS",
  description:
    "Khám phá các khóa học chất lượng cao và nâng cao kỹ năng của bạn",
};

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
}

interface CoursePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CoursePage({ searchParams }: CoursePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Khóa học"
        description="Khám phá các khóa học chất lượng cao và nâng cao kỹ năng của bạn"
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <div className="h-64 animate-pulse bg-gray-200 rounded-lg" />
            }
          >
            <CourseFilters searchParams={resolvedSearchParams} />
          </Suspense>
        </div>

        {/* Course Grid */}
        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Đang tải khóa học...</span>
              </div>
            }
          >
            <CourseGrid searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
