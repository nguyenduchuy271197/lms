import { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./_components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description:
    "Đăng nhập vào hệ thống học tập trực tuyến để bắt đầu hành trình học tập của bạn",
  keywords: ["đăng nhập", "login", "truy cập", "tài khoản"],
  openGraph: {
    title: "Đăng nhập | LMS",
    description:
      "Đăng nhập vào hệ thống học tập trực tuyến để bắt đầu hành trình học tập của bạn",
  },
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-full items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin đăng nhập để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
