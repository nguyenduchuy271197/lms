"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import LessonList from "./lesson-list";
import LessonDialog from "./lesson-dialog";
import { useCourse } from "@/hooks/courses/use-course";
import { useLessonsByCourse } from "@/hooks/lessons/use-lessons-by-course";
import { Lesson } from "@/types/custom.types";

interface LessonManagementContainerProps {
  courseId: string;
}

export default function LessonManagementContainer({
  courseId,
}: LessonManagementContainerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const { data: course, isLoading: courseLoading } = useCourse({
    id: courseId,
  });
  const { data: lessons, isLoading: lessonsLoading } = useLessonsByCourse({
    course_id: courseId,
  });

  const handleCreateLesson = () => {
    setCreateDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setEditDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setEditingLesson(null);
  };

  if (courseLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-20 bg-muted rounded" />
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không tìm thấy khóa học</p>
        <Link href="/admin/courses">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/courses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Bài học - ${course.title}`}
        description={`Quản lý bài học trong khóa học "${course.title}"`}
        action={
          <Button onClick={handleCreateLesson}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm bài học mới
          </Button>
        }
      />

      <LessonList
        lessons={lessons || []}
        isLoading={lessonsLoading}
        onEditLesson={handleEditLesson}
        courseId={courseId}
      />

      {/* Create Lesson Dialog */}
      <LessonDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        courseId={courseId}
        onSuccess={handleCloseDialogs}
      />

      {/* Edit Lesson Dialog */}
      <LessonDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        courseId={courseId}
        lesson={editingLesson}
        onSuccess={handleCloseDialogs}
      />
    </div>
  );
}
