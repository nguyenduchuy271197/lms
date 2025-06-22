import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect if already authenticated
  const user = await getServerUser();
  if (user) {
    redirect("/dashboard");
  }

  return <div className="min-h-screen">{children}</div>;
}
