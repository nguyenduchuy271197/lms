# 🎓 LMS - Learning Management System

Hệ thống quản lý học tập được xây dựng với Next.js 14, TypeScript và Supabase.

## ✨ Tính năng

- 🔐 **Authentication**: Đăng ký/đăng nhập, phân quyền Admin/Student
- 📚 **Course Management**: Tạo, quản lý khóa học và categories
- 🎥 **Lesson Management**: Upload video, theo dõi progress
- 📊 **Dashboard**: Admin analytics, Student progress tracking
- 📱 **Responsive**: Mobile-first design

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase, PostgreSQL
- **State Management**: TanStack Query, React Hook Form
- **Validation**: Zod

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/nguyenduchuy271197/lms
cd lms
pnpm install
```

### 2. Environment Setup

Tạo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

```bash
npx supabase db reset
```

### 4. Run Development

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── actions/          # Server actions
├── app/             # Next.js App Router
│   ├── (auth)/      # Auth pages
│   ├── (dashboard)/ # Dashboard
│   └── (main)/      # Public pages
├── components/      # UI components
├── hooks/           # Custom hooks
├── lib/             # Utilities & config
└── types/           # TypeScript types
```

## 🔧 Scripts

```bash
pnpm dev      # Development server
pnpm build    # Build production
pnpm lint     # Run linter
```

## 👥 User Roles

### 👨‍🎓 Student

- Xem và đăng ký khóa học
- Theo dõi progress học tập
- Quản lý profile

### 👨‍💼 Admin

- Quản lý courses & lessons
- Quản lý users & categories
- Xem analytics & reports

## 🚀 Deployment

Deploy dễ dàng với [Vercel](https://vercel.com):

1. Connect repository
2. Set environment variables
3. Deploy
