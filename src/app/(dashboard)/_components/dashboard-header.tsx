"use client";

import { AuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import UserNav from "@/components/shared/user-nav";
import { useMobileSidebar } from "@/components/providers/mobile-sidebar-provider";

interface DashboardHeaderProps {
  user: AuthUser;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { toggle } = useMobileSidebar();

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
