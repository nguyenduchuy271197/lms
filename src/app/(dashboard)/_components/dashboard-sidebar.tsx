"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Users,
  BarChart3,
  GraduationCap,
  Tags,
} from "lucide-react";
import { AuthUser } from "@/lib/auth";

interface DashboardSidebarProps {
  user: AuthUser;
}

const studentNavItems = [
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
    title: "Hồ sơ cá nhân",
    href: "/dashboard/profile",
    icon: User,
  },
];

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý khóa học",
    href: "/dashboard/admin/courses",
    icon: GraduationCap,
  },
  {
    title: "Quản lý danh mục",
    href: "/dashboard/admin/categories",
    icon: Tags,
  },
  {
    title: "Báo cáo",
    href: "/dashboard/admin/reports",
    icon: BarChart3,
  },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  // Get navigation items based on user role
  const getNavItems = () => {
    switch (user.profile.role) {
      case "admin":
        return adminNavItems;
      case "student":
      default:
        return studentNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-card border-r">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">LMS Platform</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* User Info */}
        <div className="px-3 py-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.profile.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.profile.role === "admin" ? "Quản trị viên" : "Học viên"}
              </p>
            </div>
          </div>
        </div>

        <Separator className="mx-3 mb-4" />

        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => (
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
      </ScrollArea>
    </div>
  );
}
