"use client";

import { AuthUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/hooks/auth/use-logout";

interface UserNavProps {
  user: AuthUser;
  showNotifications?: boolean;
}

export default function UserNav({ user }: UserNavProps) {
  const logout = useLogout({
    redirect: "/login",
  });

  const handleLogout = () => {
    logout.mutate();
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.profile.avatar_url || ""}
              alt={user.profile.full_name || ""}
            />
            <AvatarFallback>
              {getUserInitials(user.profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.profile.full_name || "Người dùng"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={user.profile.role === "admin" ? "/admin" : "/dashboard"}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>
              {user.profile.role === "admin" ? "Quản trị" : "Dashboard"}
            </span>
          </Link>
        </DropdownMenuItem>

        {user.profile.role === "student" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/my-courses">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Khóa học của tôi</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{logout.isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
