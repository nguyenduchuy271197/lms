"use client";

import { useCourses } from "@/hooks/courses/use-courses";
import CourseCard from "@/app/courses/_components/course-card";
import CoursePagination from "@/app/courses/_components/course-pagination";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

interface SearchParams {
  page?: string;
}

interface CategoryCoursesProps {
  categoryId: string;
  searchParams: SearchParams;
}

const ITEMS_PER_PAGE = 12;

export default function CategoryCourses({
  categoryId,
  searchParams,
}: CategoryCoursesProps) {
  const { data: courses = [], isLoading, error } = useCourses();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const currentPage = parseInt(searchParams.page || "1");

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => course.category_id === categoryId);
  }, [courses, categoryId]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse bg-gray-200 rounded-md" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse bg-gray-200 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải khóa học</p>
        <p className="text-sm text-gray-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {filteredCourses.length > 0 ? (
            <>
              Hiển thị {startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredCourses.length)}{" "}
              của {filteredCourses.length} khóa học
            </>
          ) : (
            "Không có khóa học nào"
          )}
        </div>

        {filteredCourses.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Course Grid/List */}
      {paginatedCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">
            Chưa có khóa học nào trong danh mục này
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng quay lại sau để xem thêm khóa học mới
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {paginatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <CoursePagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={{ page: searchParams.page }}
        />
      )}
    </div>
  );
}
