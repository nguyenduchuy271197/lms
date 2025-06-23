import { requireAuth } from "@/lib/auth";
import DashboardSidebar from "./_components/dashboard-sidebar";
import DashboardHeader from "./_components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication
  const user = await requireAuth();

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
