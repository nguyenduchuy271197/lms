import { Course } from "@/types/custom.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, BookOpen } from "lucide-react";

interface CourseContentProps {
  course: Course;
}

export default function CourseContent({ course }: CourseContentProps) {
  const { description, objectives } = course;

  return (
    <div className="space-y-6">
      {/* Course Description */}
      {description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mô tả khóa học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Objectives */}
      {objectives && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mục tiêu học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {objectives}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Course Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Trình độ:</span>
              <span className="ml-2 text-gray-600">Tất cả trình độ</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Ngôn ngữ:</span>
              <span className="ml-2 text-gray-600">Tiếng Việt</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Loại khóa học:</span>
              <span className="ml-2 text-gray-600">Video trực tuyến</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Cập nhật:</span>
              <span className="ml-2 text-gray-600">
                {new Date(course.updated_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
