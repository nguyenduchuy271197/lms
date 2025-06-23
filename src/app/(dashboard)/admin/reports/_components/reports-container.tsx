"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useAdminStats } from "@/hooks/dashboard/use-admin-stats";
import { GetAdminDashboardStatsInput } from "@/lib/validations/dashboard-analytics";
import OverviewCards from "./overview-cards";
import CoursePerformanceChart from "./course-performance-chart";
import CategoryPerformanceChart from "./category-performance-chart";
import { toast } from "sonner";

export default function ReportsContainer() {
  const [period, setPeriod] =
    useState<GetAdminDashboardStatsInput["period"]>("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: stats,
    isLoading,
    refetch,
    error,
  } = useAdminStats({
    period,
    include_trends: true,
    include_breakdowns: true,
  });

  const handleRefresh = () => {
    refetch();
    toast.success("Dữ liệu đã được làm mới");
  };

  const handleExport = () => {
    toast.info("Tính năng xuất báo cáo đang được phát triển");
  };

  const periodOptions = [
    { value: "7d", label: "7 ngày qua" },
    { value: "30d", label: "30 ngày qua" },
    { value: "90d", label: "90 ngày qua" },
    { value: "1y", label: "1 năm qua" },
    { value: "all", label: "Tất cả thời gian" },
  ];

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Có lỗi xảy ra khi tải dữ liệu báo cáo
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Khoảng thời gian:</label>
              <Select
                value={period}
                onValueChange={(value) =>
                  setPeriod(value as GetAdminDashboardStatsInput["period"])
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewCards data={stats} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CoursePerformanceChart data={stats} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryPerformanceChart data={stats} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
