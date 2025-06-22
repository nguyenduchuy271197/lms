import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function MyCoursesSkeletonList() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* Course Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Image Skeleton */}
                <Skeleton className="aspect-video w-full rounded-lg" />

                {/* Content Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Progress Skeleton */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>

                {/* Date Skeleton */}
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Skeleton className="h-9 w-full rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
