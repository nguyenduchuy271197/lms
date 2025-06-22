"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
}

interface CoursePaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
}

export default function CoursePagination({
  currentPage,
  totalPages,
  searchParams,
}: CoursePaginationProps) {
  const router = useRouter();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();

    if (searchParams.search) {
      params.set("search", searchParams.search);
    }

    if (searchParams.category) {
      params.set("category", searchParams.category);
    }

    if (page > 1) {
      params.set("page", page.toString());
    }

    return `/courses?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    router.push(createPageUrl(page));
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Trước
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers[0] > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
              1
            </Button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Tiếp
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
