"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/auth/use-logout";

export default function LogoutButton() {
  const logout = useLogout({
    redirect: "/login",
  });

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={logout.isPending}
      className="flex w-full items-center"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{logout.isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
    </button>
  );
}
