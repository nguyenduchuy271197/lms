import { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "./_components/register-form";
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
  title: "Đăng ký | LMS",
  description: "Tạo tài khoản mới cho hệ thống học tập trực tuyến",
};

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-full items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Đăng ký tài khoản
            </CardTitle>
            <CardDescription className="text-center">
              Tạo tài khoản mới để bắt đầu học tập
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
              <RegisterForm />
            </Suspense>
          </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
