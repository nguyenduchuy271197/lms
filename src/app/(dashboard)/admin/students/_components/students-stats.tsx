import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, GraduationCap, TrendingUp } from "lucide-react";
import { LABELS } from "@/constants/labels";

interface StudentsStatsProps {
  statistics: {
    total_students: number;
    active_students: number;
    students_with_enrollments: number;
    average_completion_rate: number;
  };
}

export default function StudentsStats({ statistics }: StudentsStatsProps) {
  const stats = [
    {
      title: LABELS.ADMIN.total_students,
      value: statistics.total_students,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: LABELS.ADMIN.active_students,
      value: statistics.active_students,
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Học viên có khóa học",
      value: statistics.students_with_enrollments,
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      title: "Tỷ lệ hoàn thành TB",
      value: `${statistics.average_completion_rate}%`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
