import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/types/custom.types";
import { FolderOpen, Hash, TrendingUp, Eye } from "lucide-react";

interface CategoriesStatsProps {
  categories: Category[];
}

export default function CategoriesStats({ categories }: CategoriesStatsProps) {
  const totalCategories = categories.length;
  const categoriesWithDescription = categories.filter(
    (c) => c.description && c.description.trim() !== ""
  ).length;
  const avgDescriptionLength =
    categories.reduce((sum, c) => sum + (c.description?.length || 0), 0) /
      totalCategories || 0;
  const recentCategories = categories.filter((c) => {
    const createdAt = new Date(c.created_at);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdAt >= oneWeekAgo;
  }).length;

  const stats = [
    {
      title: "Tổng danh mục",
      value: totalCategories,
      description: "Tất cả danh mục hiện có",
      icon: FolderOpen,
      color: "text-blue-600",
    },
    {
      title: "Có mô tả",
      value: categoriesWithDescription,
      description: `${
        Math.round((categoriesWithDescription / totalCategories) * 100) || 0
      }% có mô tả chi tiết`,
      icon: Hash,
      color: "text-green-600",
    },
    {
      title: "Mô tả trung bình",
      value: Math.round(avgDescriptionLength),
      description: "Ký tự trong mô tả",
      icon: Eye,
      color: "text-purple-600",
    },
    {
      title: "Mới tuần này",
      value: recentCategories,
      description: "Danh mục được tạo gần đây",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
