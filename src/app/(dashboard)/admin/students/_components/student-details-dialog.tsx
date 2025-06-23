"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Clock,
  TrendingUp,
  CheckCircle,
  Calendar,
  Mail,
  GraduationCap,
  Activity,
} from "lucide-react";
import { useStudentDetails } from "@/hooks/admin/students/use-student-details";
import { useStudentProgress } from "@/hooks/admin/students/use-student-progress";
import { LABELS, formatDuration } from "@/constants/labels";

interface StudentDetailsDialogProps {
  studentId: string;
  open: boolean;
  onClose: () => void;
}

export default function StudentDetailsDialog({
  studentId,
  open,
  onClose,
}: StudentDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: studentDetails,
    isLoading: detailsLoading,
    error: detailsError,
  } = useStudentDetails({
    student_id: studentId,
    include_enrollments: true,
    include_progress: true,
    include_analytics: true,
  });

  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useStudentProgress({
    student_id: studentId,
    include_lessons: true,
    include_watch_time: true,
    status_filter: "all",
  });

  if (detailsLoading || progressLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết học viên</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (detailsError || progressError || !studentDetails) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết học viên</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">
              Lỗi tải dữ liệu: {detailsError?.message || progressError?.message}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { student, enrollments, analytics } = studentDetails;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.avatar_url || undefined} />
              <AvatarFallback>
                {student.full_name?.charAt(0) || student.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {student.full_name || student.email}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="progress">Tiến độ học tập</TabsTrigger>
              <TabsTrigger value="enrollments">Khóa học</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Thông tin cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Họ tên
                      </label>
                      <p>{student.full_name || "Chưa cập nhật"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Vai trò
                      </label>
                      <div>
                        <Badge
                          variant={
                            student.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {LABELS.USER_ROLES[student.role]}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Ngày tham gia
                      </label>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(student.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              {analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Thống kê học tập
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.total_enrollments}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tổng khóa học
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.completed_courses}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Đã hoàn thành
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {analytics.active_courses}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Đang học
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatDuration(analytics.total_watch_time)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tổng thời gian
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-4">
              {progressData && (
                <>
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Tổng quan tiến độ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {progressData.summary.overall_progress}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tiến độ tổng thể
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {progressData.summary.learning_streak}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Streak học tập
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {formatDuration(
                              progressData.summary.total_watch_time
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Thời gian học
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Course Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tiến độ từng khóa học</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {progressData.courses.map((course) => (
                        <div
                          key={course.course_id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">
                                {course.course_title}
                              </h4>
                              {course.category_name && (
                                <p className="text-sm text-muted-foreground">
                                  {course.category_name}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                course.enrollment_status === "completed"
                                  ? "default"
                                  : course.enrollment_status === "active"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {
                                LABELS.ENROLLMENT_STATUS[
                                  course.enrollment_status
                                ]
                              }
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                Tiến độ: {course.completed_lessons}/
                                {course.total_lessons} bài
                              </span>
                              <span>{course.overall_progress}%</span>
                            </div>
                            <Progress
                              value={course.overall_progress}
                              className="h-2"
                            />

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDuration(course.total_watch_time)}
                              </span>
                              <span>
                                Ghi danh:{" "}
                                {new Date(
                                  course.enrolled_at
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Danh sách khóa học đã ghi danh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollments && enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {enrollment.courses?.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {enrollment.courses?.description}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Ghi danh:{" "}
                                  {new Date(
                                    enrollment.enrolled_at
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                                {enrollment.completed_at && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Hoàn thành:{" "}
                                    {new Date(
                                      enrollment.completed_at
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                )}
                              </div>
                            </div>

                            <Badge
                              variant={
                                enrollment.status === "completed"
                                  ? "default"
                                  : enrollment.status === "active"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {LABELS.ENROLLMENT_STATUS[enrollment.status]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Học viên chưa ghi danh khóa học nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
