"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CourseSearchProps {
  defaultValue?: string;
}

export default function CourseSearch({ defaultValue = "" }: CourseSearchProps) {
  const [searchValue, setSearchValue] = useState(defaultValue);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    // Reset to first page when searching
    params.delete("page");

    router.push(`/courses?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("page");
    router.push(`/courses?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-8"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Button onClick={handleSearch} size="sm">
        <Search className="h-4 w-4 mr-1" />
        Tìm kiếm
      </Button>
    </div>
  );
}
