import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-md fixed top-0 z-50 w-full">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">LMS Platform</span>
        </Link>
      </div>
    </header>
  );
}
