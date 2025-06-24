"use client";

import { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import UserNav from "@/components/shared/user-nav";

interface DashboardHeaderProps {
  user: AuthUser;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Breadcrumb or page title could go here */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
