"use client";

import { useState } from "react";
import { useAllStudents } from "@/hooks/admin/students/use-all-students";
import { GetAllStudentsAdminInput } from "@/lib/validations/admin-student-management";
import StudentsTable from "./students-table";
import StudentsFilters from "./students-filters";
import StudentsStats from "./students-stats";
import StudentDetailsDialog from "./student-details-dialog";
import { toast } from "sonner";

export default function StudentsManagementContainer() {
  const [filters, setFilters] = useState<GetAllStudentsAdminInput>({
    page: 1,
    limit: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  const {
    data: studentsData,
    isLoading,
    error,
    refetch,
  } = useAllStudents(filters);

  const handleFiltersChange = (
    newFilters: Partial<GetAllStudentsAdminInput>
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset to page 1 when filters change (except explicit page change)
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleCloseDetails = () => {
    setSelectedStudentId(null);
  };

  if (error) {
    toast.error("Lỗi tải dữ liệu", {
      description: error.message,
    });
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {studentsData?.statistics && (
        <StudentsStats statistics={studentsData.statistics} />
      )}

      {/* Filters */}
      <StudentsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      {/* Table */}
      <StudentsTable
        students={studentsData?.students || []}
        pagination={{
          page: studentsData?.page || 1,
          limit: studentsData?.limit || 10,
          total: studentsData?.total || 0,
          totalPages: studentsData?.total_pages || 1,
          hasNext: studentsData?.has_next || false,
          hasPrevious: studentsData?.has_previous || false,
        }}
        onPageChange={handlePageChange}
        onStudentSelect={handleStudentSelect}
        isLoading={isLoading}
      />

      {/* Student Details Dialog */}
      {selectedStudentId && (
        <StudentDetailsDialog
          studentId={selectedStudentId}
          open={!!selectedStudentId}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
