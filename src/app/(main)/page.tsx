import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCategories } from "@/actions/categories/get-categories";
import { getCourses } from "@/actions/courses/get-courses";
import { Loading } from "@/components/shared/loading";
import CourseCategoriesSection from "./_components/course-categories-section";

export default async function HomePage() {
  // Fetch categories and courses server-side
  const [categoriesResult, coursesResult] = await Promise.all([
    getCategories(),
    getCourses(),
  ]);

  const categories = categoriesResult.success
    ? categoriesResult.data.slice(0, 6)
    : [];
  const allCourses = coursesResult.success ? coursesResult.data : [];

  // Group courses by category
  const categoriesWithCourses = categories.map((category) => {
    const courses = allCourses
      .filter((course) => course.category_id === category.id)
      .slice(0, 4); // Limit to 4 courses per category

    return {
      category,
      courses,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Nền tảng học tập
            <span className="text-primary"> trực tuyến</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Khám phá hàng ngàn khóa học chất lượng cao, học tập theo tiến độ của
            bạn và nâng cao kỹ năng cùng những giảng viên hàng đầu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Bắt đầu học tập</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Khám phá khóa học</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <Suspense
        fallback={
          <Loading
            text="Đang tải danh mục khóa học..."
            size="lg"
            className="py-20"
          />
        }
      >
        <CourseCategoriesSection
          categoriesWithCourses={categoriesWithCourses}
          allCourses={allCourses}
        />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng triệu học viên đã tin tưởng chọn nền tảng của
            chúng tôi
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Đăng ký miễn phí ngay</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
