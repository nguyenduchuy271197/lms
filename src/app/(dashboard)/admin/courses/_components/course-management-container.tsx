"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import CourseFilters from "./course-filters";
import CourseTable from "./course-table";
import CourseDialog from "./course-dialog";
import { Course } from "@/types/custom.types";

export default function CourseManagementContainer() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleCreateCourse = () => {
    setCreateDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingCourse(null);
  };

  const handleCourseSelection = (courseIds: string[]) => {
    setSelectedCourses(courseIds);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khóa học"
        description="Tạo và quản lý các khóa học trong hệ thống"
        action={
          <Button onClick={handleCreateCourse}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo khóa học mới
          </Button>
        }
      />

      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCount={selectedCourses.length}
      />

      <CourseTable
        search={search}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        page={page}
        onPageChange={setPage}
        selectedCourses={selectedCourses}
        onSelectionChange={handleCourseSelection}
        onEditCourse={handleEditCourse}
      />

      {/* Create Course Dialog */}
      <CourseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCloseDialogs}
      />

      {/* Edit Course Dialog */}
      <CourseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        course={editingCourse}
        onSuccess={handleCloseDialogs}
      />
    </div>
  );
}
