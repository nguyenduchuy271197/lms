import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategories } from "@/actions/categories/get-categories";
import CategoryCourses from "./_components/category-courses";
import { PageHeader } from "@/components/shared/page-header";
import { Loading } from "@/components/shared/loading";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategories();

  if (!result.success) {
    return {
      title: "Danh mục không tìm thấy | LMS",
      description: "Danh mục bạn đang tìm kiếm không tồn tại.",
    };
  }

  // Find category by slug
  const category = result.data.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: "Danh mục không tìm thấy | LMS",
      description: "Danh mục bạn đang tìm kiếm không tồn tại.",
    };
  }

  return {
    title: `${category.name} | LMS`,
    description:
      category.description ||
      `Khám phá các khóa học trong danh mục ${category.name}`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Fetch categories to find the current one
  const result = await getCategories();

  if (!result.success) {
    notFound();
  }

  // Find category by slug
  const category = result.data.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={category.name}
        description={
          category.description ||
          `Khám phá các khóa học trong danh mục ${category.name}`
        }
      />

      <div className="mt-8">
        <Suspense fallback={<Loading text="Đang tải khóa học..." size="lg" />}>
          <CategoryCourses
            categoryId={category.id}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
