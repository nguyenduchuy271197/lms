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
    // Check user role and redirect accordingly
    if (user.profile.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return <div className="min-h-screen">{children}</div>;
}
