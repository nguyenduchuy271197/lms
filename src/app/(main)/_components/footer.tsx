import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
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
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 LMS Platform. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
