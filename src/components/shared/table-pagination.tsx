import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: TablePaginationProps) {
  // Handle case when totalItems is 0 or invalid
  const safeCurrentPage = Math.max(1, currentPage || 1);
  const safeTotalItems = Math.max(0, totalItems || 0);
  const safeItemsPerPage = Math.max(1, itemsPerPage || 10);
  const safeTotalPages = Math.max(1, totalPages || 1);

  const startItem =
    safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem =
    safeTotalItems === 0
      ? 0
      : Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, safeCurrentPage - 2);
      const end = Math.min(safeTotalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-muted-foreground">
        {safeTotalItems === 0
          ? "Không có kết quả"
          : `Hiển thị ${startItem}-${endItem} trong ${safeTotalItems} kết quả`}
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1 || safeTotalItems === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === safeCurrentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-[40px]"
            disabled={safeTotalItems === 0}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages || safeTotalItems === 0}
        >
          Tiếp
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
