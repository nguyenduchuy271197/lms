import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Clock, Award } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  // Redirect to dashboard if already authenticated
  const user = await getServerUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">LMS Platform</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Nền tảng học tập
            <span className="text-primary"> trực tuyến</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Khám phá hàng ngàn khóa học chất lượng cao, học tập theo tiến độ của
            bạn và nâng cao kỹ năng cùng những giảng viên hàng đầu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Bắt đầu học tập</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Khám phá khóa học</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn chúng tôi?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi cung cấp trải nghiệm học tập toàn diện với những tính
              năng hiện đại
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Khóa học đa dạng</CardTitle>
                <CardDescription>
                  Hàng ngàn khóa học từ cơ bản đến nâng cao
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Cộng đồng học tập</CardTitle>
                <CardDescription>
                  Kết nối với hàng triệu học viên trên toàn thế giới
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Học mọi lúc mọi nơi</CardTitle>
                <CardDescription>
                  Truy cập khóa học 24/7 trên mọi thiết bị
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Chứng chí uy tín</CardTitle>
                <CardDescription>
                  Nhận chứng chỉ được công nhận sau khi hoàn thành
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng triệu học viên đã tin tưởng chọn nền tảng của
            chúng tôi
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Đăng ký miễn phí ngay</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">LMS Platform</span>
              </div>
              <p className="text-slate-400">
                Nền tảng học tập trực tuyến hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Về chúng tôi</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Chính sách
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Điều khoản
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Khóa học</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Lập trình
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Thiết kế
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Marketing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 LMS Platform. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
