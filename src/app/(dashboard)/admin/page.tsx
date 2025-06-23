import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminStatsContainer } from "./_components/admin-stats-container";

export default async function AdminPage() {
  // Authentication check
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản trị hệ thống"
        description="Tổng quan và quản lý toàn bộ hệ thống LMS"
      />

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminStatsContainer />
      </Suspense>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1 animate-pulse" />
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
