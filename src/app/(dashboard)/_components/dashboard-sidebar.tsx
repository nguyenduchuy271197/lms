"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Users,
  GraduationCap,
  Tags,
} from "lucide-react";
import { AuthUser } from "@/lib/auth";
import { useMobileSidebar } from "@/components/providers/mobile-sidebar-provider";

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
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý học viên",
    href: "/admin/students",
    icon: GraduationCap,
  },
  {
    title: "Quản lý khóa học",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Quản lý danh mục",
    href: "/admin/categories",
    icon: Tags,
  },
  // {
  //   title: "Báo cáo",
  //   href: "/admin/reports",
  //   icon: BarChart3,
  // },
];

function SidebarContent({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { setIsOpen } = useMobileSidebar();

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

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
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
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin/courses" ||
              item.href === "/admin/students" ||
              item.href === "/admin/users"
                ? pathname.startsWith(item.href)
                : pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-secondary"
                )}
                asChild
              >
                <Link href={item.href} onClick={handleLinkClick}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const { isOpen, setIsOpen } = useMobileSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r flex-col">
        <SidebarContent user={user} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full bg-card">
            <SidebarContent user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
