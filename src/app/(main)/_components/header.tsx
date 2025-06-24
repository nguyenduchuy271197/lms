import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getServerUser } from "@/lib/auth";
import UserNav from "@/components/shared/user-nav";

export default async function Header() {
  const user = await getServerUser();

  return (
    <header className="border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">LMS Platform</span>
        </Link>

        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {/* Dashboard Link for authenticated users */}
              <Button variant="ghost" asChild>
                <Link
                  href={user.profile.role === "admin" ? "/admin" : "/dashboard"}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {user.profile.role === "admin" ? "Quản trị" : "Dashboard"}
                </Link>
              </Button>

              {/* User Menu */}
              <UserNav user={user} />
            </>
          ) : (
            <>
              {/* Login/Register buttons for guests */}
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
