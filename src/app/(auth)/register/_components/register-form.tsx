"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/auth/use-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const register = useRegister({
    onSuccess: () => {
      router.push("/login?message=registration-success");
    },
  });

  const onSubmit = (data: RegisterInput) => {
    register.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Nhập họ và tên"
          {...form.register("fullName")}
          disabled={register.isPending}
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...form.register("email")}
          disabled={register.isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            {...form.register("password")}
            disabled={register.isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={register.isPending}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={register.isPending}>
        {register.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng ký...
          </>
        ) : (
          "Tạo tài khoản"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng và chính sách bảo
        mật của chúng tôi.
      </p>
    </form>
  );
}
