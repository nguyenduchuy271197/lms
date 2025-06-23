"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  GripVertical,
  Play,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteLesson } from "@/hooks/lessons/use-delete-lesson";
import { usePublishLesson } from "@/hooks/lessons/use-publish-lesson";
import { useReorderLessons } from "@/hooks/lessons/use-reorder-lessons";
import { Lesson } from "@/types/custom.types";
import { LABELS } from "@/constants/labels";
import { formatDuration } from "@/constants/labels";
import { toast } from "sonner";

// Sortable Item Component
interface SortableItemProps {
  lesson: Lesson;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onTogglePublish: (lesson: Lesson) => void;
}

function SortableItem({
  lesson,
  onEditLesson,
  onDeleteLesson,
  onTogglePublish,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? "opacity-50" : ""}`}
    >
      <CardContent className="px-6">
        <div className="flex items-center space-x-4">
          {/* Drag Handle */}
          <Button
            variant="ghost"
            size="sm"
            className="cursor-move opacity-50 group-hover:opacity-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>

          {/* Order Index */}
          <div className="w-8 text-center">
            <Badge variant="outline" className="text-xs">
              {lesson.order_index}
            </Badge>
          </div>

          {/* Video Thumbnail/Icon */}
          <Avatar className="h-12 w-16 rounded-md">
            <AvatarFallback className="rounded-md">
              <Play className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium truncate">{lesson.title}</h3>
              <Badge variant={lesson.is_published ? "default" : "secondary"}>
                {lesson.is_published ? "Đã xuất bản" : "Bản nháp"}
              </Badge>
            </div>
            {lesson.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
              {lesson.duration_seconds && lesson.duration_seconds > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(lesson.duration_seconds)}</span>
                </div>
              )}
              <span>
                Tạo ngày{" "}
                {format(new Date(lesson.created_at), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditLesson(lesson)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePublish(lesson)}>
                {lesson.is_published ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hủy xuất bản
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Xuất bản
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteLesson(lesson)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

interface LessonListProps {
  lessons: Lesson[];
  isLoading: boolean;
  onEditLesson: (lesson: Lesson) => void;
  courseId: string;
}

export default function LessonList({
  lessons,
  isLoading,
  onEditLesson,
  courseId,
}: LessonListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [sortedLessons, setSortedLessons] = useState(() =>
    [...lessons].sort((a, b) => a.order_index - b.order_index)
  );

  const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson();
  const { mutate: publishLesson } = usePublishLesson();
  const { mutate: reorderLessons } = useReorderLessons();

  // Update sorted lessons when lessons prop changes
  useEffect(() => {
    setSortedLessons(
      [...lessons].sort((a, b) => a.order_index - b.order_index)
    );
  }, [lessons]);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteLesson = (lesson: Lesson) => {
    setDeletingLesson(lesson);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingLesson) return;

    deleteLesson(
      { id: deletingLesson.id },
      {
        onSuccess: () => {
          toast.success(LABELS.SUCCESS.deleted);
          setDeleteDialogOpen(false);
          setDeletingLesson(null);
        },
        onError: (error) => {
          toast.error(error.message || "Xóa bài học thất bại");
        },
      }
    );
  };

  const handleTogglePublish = (lesson: Lesson) => {
    publishLesson(
      { id: lesson.id, is_published: !lesson.is_published },
      {
        onSuccess: () => {
          toast.success(
            lesson.is_published
              ? "Hủy xuất bản thành công"
              : "Xuất bản thành công"
          );
        },
        onError: (error) => {
          toast.error(error.message || "Cập nhật trạng thái thất bại");
        },
      }
    );
  };

  // Drag and drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedLessons.findIndex(
        (lesson) => lesson.id === active.id
      );
      const newIndex = sortedLessons.findIndex(
        (lesson) => lesson.id === over?.id
      );

      const newLessons = arrayMove(sortedLessons, oldIndex, newIndex);
      setSortedLessons(newLessons);

      // Update order indices and send to server
      const reorderedLessons = newLessons.map((lesson, index) => ({
        id: lesson.id,
        order_index: index + 1,
      }));

      reorderLessons(
        { course_id: courseId, lessons: reorderedLessons },
        {
          onSuccess: () => {
            toast.success("Thay đổi thứ tự thành công");
          },
          onError: (error) => {
            toast.error(error.message || "Thay đổi thứ tự thất bại");
            // Revert on error
            setSortedLessons(
              [...lessons].sort((a, b) => a.order_index - b.order_index)
            );
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Play className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Chưa có bài học nào</h3>
          <p className="text-muted-foreground mt-2">
            Bắt đầu bằng cách thêm bài học đầu tiên cho khóa học này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedLessons.map((lesson) => lesson.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sortedLessons.map((lesson) => (
              <SortableItem
                key={lesson.id}
                lesson={lesson}
                onEditLesson={onEditLesson}
                onDeleteLesson={handleDeleteLesson}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Xóa bài học"
        description={`Bạn có chắc chắn muốn xóa bài học "${deletingLesson?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
