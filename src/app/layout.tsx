import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LMS",
    default: "LMS - Hệ thống quản lý học tập trực tuyến",
  },
  description:
    "Nền tảng học tập trực tuyến hàng đầu với hàng ngàn khóa học chất lượng cao",
  keywords: ["học tập trực tuyến", "khóa học", "giáo dục", "e-learning", "LMS"],
  authors: [{ name: "LMS Team" }],
  creator: "LMS Team",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "LMS",
    title: "LMS - Hệ thống quản lý học tập trực tuyến",
    description:
      "Nền tảng học tập trực tuyến hàng đầu với hàng ngàn khóa học chất lượng cao",
  },
  twitter: {
    card: "summary_large_image",
    title: "LMS - Hệ thống quản lý học tập trực tuyến",
    description:
      "Nền tảng học tập trực tuyến hàng đầu với hàng ngàn khóa học chất lượng cao",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
