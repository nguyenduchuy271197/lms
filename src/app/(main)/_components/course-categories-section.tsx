"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Category, Course } from "@/types/custom.types";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import CourseCard from "../courses/_components/course-card";

interface CourseCategoriesSectionProps {
  categoriesWithCourses: Array<{
    category: Category;
    courses: Course[];
  }>;
  allCourses: Course[];
}

export default function CourseCategoriesSection({
  categoriesWithCourses,
  allCourses,
}: CourseCategoriesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const renderCourseGrid = (courses: Course[]) => {
    if (courses.length === 0) {
      return (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">
            Chưa có khóa học nào trong danh mục này
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.slice(0, 8).map((course) => (
          <CourseCard key={course.id} course={course} viewMode="grid" />
        ))}
      </div>
    );
  };

  // Get current courses based on active category
  const getCurrentCourses = () => {
    if (activeCategory === null) {
      return allCourses;
    }

    const categoryData = categoriesWithCourses.find(
      ({ category }) => category.id === activeCategory
    );
    return categoryData?.courses || [];
  };

  // Get current category info
  const getCurrentCategoryInfo = () => {
    if (activeCategory === null) {
      return {
        name: "Tất cả khóa học",
        description: "Khám phá toàn bộ khóa học có sẵn trên nền tảng",
        slug: null,
      };
    }

    const categoryData = categoriesWithCourses.find(
      ({ category }) => category.id === activeCategory
    );
    return {
      name: categoryData?.category.name || "",
      description:
        categoryData?.category.description ||
        `Khám phá các khóa học về ${categoryData?.category.name}`,
      slug: categoryData?.category.slug || null,
    };
  };

  const currentCategoryInfo = getCurrentCategoryInfo();

  return (
    <div className="py-20 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Khóa học theo danh mục</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá các khóa học chất lượng cao được phân loại theo chuyên môn
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            onClick={() => setActiveCategory(null)}
            className={cn(
              "h-auto px-6 py-3 text-sm font-medium rounded-full",
              activeCategory === null && "shadow-md"
            )}
          >
            Tất cả
          </Button>
          {categoriesWithCourses.map(({ category }) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "h-auto px-6 py-3 text-sm font-medium rounded-full",
                activeCategory === category.id && "shadow-md"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Current Category Content */}
        <div className="space-y-8">
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {currentCategoryInfo.name}
              </h3>
              <p className="text-muted-foreground">
                {currentCategoryInfo.description}
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link
                href={
                  currentCategoryInfo.slug
                    ? `/categories/${currentCategoryInfo.slug}`
                    : "/courses"
                }
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Courses Grid */}
          {renderCourseGrid(getCurrentCourses())}
        </div>
      </div>
    </div>
  );
}
