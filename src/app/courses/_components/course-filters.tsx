"use client";

import { useCategories } from "@/hooks/categories/use-categories";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
}

interface CourseFiltersProps {
  searchParams: SearchParams;
}

export default function CourseFilters({ searchParams }: CourseFiltersProps) {
  const { data: categories = [], isLoading } = useCategories();
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const selectedCategory = searchParams.category;

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(urlSearchParams);

    if (selectedCategory === categoryId) {
      // Unselect if already selected
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }

    // Reset to first page when filtering
    params.delete("page");

    router.push(`/courses?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(urlSearchParams);
    params.delete("category");
    params.delete("page");
    router.push(`/courses?${params.toString()}`);
  };

  const hasFilters = selectedCategory;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium mb-3">Danh mục</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <Badge variant="secondary" className="ml-auto">
                    Đã chọn
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Additional filters can be added here */}
        <div>
          <h4 className="font-medium mb-3">Khác</h4>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Thêm bộ lọc sẽ được cập nhật trong tương lai</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
