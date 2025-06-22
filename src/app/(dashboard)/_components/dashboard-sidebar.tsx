"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Users,
  FolderOpen,
  Settings,
  BarChart3,
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Khóa học của tôi",
    href: "/dashboard/my-courses",
    icon: BookOpen,
  },
  {
    title: "Khám phá khóa học",
    href: "/dashboard/courses",
    icon: FolderOpen,
  },
  {
    title: "Hồ sơ cá nhân",
    href: "/dashboard/profile",
    icon: User,
  },
];

const adminNavItems = [
  {
    title: "Quản lý người dùng",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý khóa học",
    href: "/dashboard/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Báo cáo",
    href: "/dashboard/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Cài đặt",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">LMS Platform</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {sidebarNavItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-secondary"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>

        {/* Admin Section - TODO: Show only for admin users */}
        <div className="mt-8">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quản trị
            </h3>
          </div>
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-secondary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
