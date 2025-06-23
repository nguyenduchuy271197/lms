import { Metadata } from "next";
import { Suspense } from "react";
import CourseGrid from "./_components/course-grid";
import CourseFilters from "./_components/course-filters";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";

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
            fallback={<Loading variant="card" text="Đang tải bộ lọc..." />}
          >
            <CourseFilters searchParams={resolvedSearchParams} />
          </Suspense>
        </div>

        {/* Course Grid */}
        <div className="lg:col-span-3">
          <Suspense
            fallback={<Loading text="Đang tải khóa học..." size="lg" />}
          >
            <CourseGrid searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
