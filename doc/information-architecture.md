# Information Architecture - LMS MVP

_Dựa trên Database Schema và Complete Actions/Hooks Implementation_

## Tổng quan Hệ thống MVP

### Đối tượng người dùng

- **Học viên (Students)**: Học tập và theo dõi tiến độ khóa học
- **Quản trị viên (Admins)**: Tạo khóa học, quản lý nội dung và phân tích dữ liệu
- **Guest**: Xem danh sách khóa học không cần đăng ký

### Mục tiêu MVP

- Cung cấp nền tảng học tập trực tuyến đơn giản và hiệu quả
- Cho phép admin tạo và quản lý khóa học video
- Theo dõi tiến độ học tập chi tiết của học viên
- Cung cấp dashboard và analytics cơ bản

## Cấu trúc Navigation MVP

### 1. Guest Navigation (Public Pages)

```
🌐 Public Pages
├── 🏠 Trang chủ
│   ├── Hero section với giới thiệu
│   ├── Khóa học nổi bật
│   ├── Thống kê nền tảng
│   └── CTA đăng ký
├── 📚 Danh sách khóa học
│   ├── Grid view các khóa học
│   ├── Lọc theo danh mục
│   ├── Tìm kiếm khóa học
│   ├── Sắp xếp (mới nhất, phổ biến)
│   └── Pagination
├── 📖 Chi tiết khóa học
│   ├── Thông tin tổng quan
│   ├── Mục tiêu khóa học
│   ├── Danh sách video (preview)
│   ├── Thống kê (số học viên, thời lượng)
│   └── CTA đăng ký để học
├── 🗂️ Danh mục
│   ├── Tất cả danh mục
│   ├── Khóa học theo danh mục
│   └── Mô tả danh mục
├── 🔑 Đăng nhập
└── ✍️ Đăng ký
    ├── Đăng ký học viên
    └── Đăng ký admin (invite only)
```

### 2. Student Navigation

```
👤 Student Dashboard
├── 🏠 Dashboard
│   ├── Tiến độ tổng quan
│   ├── Khóa học đang học
│   ├── Khóa học hoàn thành
│   ├── Khóa học gợi ý
│   ├── Hoạt động gần đây
│   └── Thống kê cá nhân
├── 📚 Khóa học của tôi
│   ├── Đang học (active)
│   ├── Đã hoàn thành (completed)
│   ├── Tạm ngưng (dropped)
│   ├── Lọc theo tiến độ
│   └── Tìm kiếm trong khóa học
├── 🔍 Khám phá khóa học
│   ├── Tất cả khóa học
│   ├── Tìm kiếm nâng cao
│   ├── Lọc theo danh mục
│   ├── Sắp xếp và filter
│   └── Đăng ký khóa học mới
├── 📺 Học tập
│   ├── Video player với controls
│   ├── Tốc độ phát tùy chỉnh
│   ├── Chất lượng video
│   ├── Fullscreen mode
│   ├── Progress tracking
│   ├── Đánh dấu hoàn thành
│   ├── Ghi chú cá nhân
│   └── Navigation giữa videos
├── 📊 Tiến độ học tập
│   ├── Tổng quan tiến độ
│   ├── Tiến độ theo khóa học
│   ├── Thời gian học tập
│   ├── Streak học tập
│   ├── Thống kê cá nhân
│   └── Mục tiêu học tập
├── 👤 Hồ sơ cá nhân
│   ├── Thông tin cơ bản
│   ├── Avatar và liên hệ
│   ├── Đổi mật khẩu
│   ├── Cài đặt thông báo
│   └── Sở thích học tập
└── ⚙️ Cài đặt
    ├── Thông tin tài khoản
    ├── Preferences học tập
    ├── Notification settings
    └── Privacy settings
```

### 3. Admin Navigation

```
🛡️ Admin Dashboard
├── 🏠 Tổng quan
│   ├── Thống kê hệ thống
│   │   ├── Tổng số học viên
│   │   ├── Tổng số khóa học
│   │   ├── Tổng số video
│   │   ├── Thời gian học tập
│   │   └── Hoạt động hôm nay
│   ├── Hoạt động gần đây
│   │   ├── Đăng ký mới
│   │   ├── Khóa học hoàn thành
│   │   └── Video được xem nhiều
│   ├── Khóa học hiệu suất cao
│   └── Cảnh báo hệ thống
├── 👥 Quản lý Học viên
│   ├── Danh sách học viên
│   │   ├── Tìm kiếm học viên
│   │   ├── Lọc theo trạng thái
│   │   ├── Lọc theo thời gian đăng ký
│   │   └── Export danh sách
│   ├── Chi tiết học viên
│   │   ├── Thông tin cá nhân
│   │   ├── Lịch sử học tập
│   │   ├── Tiến độ khóa học
│   │   ├── Thống kê hoạt động
│   │   └── Quản lý vai trò
│   ├── Thống kê học viên
│   │   ├── Đăng ký theo thời gian
│   │   ├── Độ tương tác
│   │   ├── Tỷ lệ hoàn thành
│   │   └── Phân tích hành vi
│   └── Quản lý tài khoản
│       ├── Kích hoạt/Vô hiệu hóa
│       ├── Đổi vai trò
│       └── Reset mật khẩu
├── 🗂️ Quản lý Danh mục
│   ├── Danh sách danh mục
│   │   ├── Tạo danh mục mới
│   │   ├── Chỉnh sửa danh mục
│   │   ├── Xóa danh mục
│   │   └── Sắp xếp thứ tự
│   ├── Thống kê danh mục
│   │   ├── Số lượng khóa học
│   │   ├── Độ phổ biến
│   │   └── Tỷ lệ hoàn thành
│   └── SEO & Meta
│       ├── Slug management
│       ├── Meta description
│       └── Featured image
├── 📚 Quản lý Khóa học
│   ├── Danh sách khóa học
│   │   ├── Tất cả khóa học
│   │   ├── Lọc theo trạng thái
│   │   ├── Lọc theo danh mục
│   │   ├── Tìm kiếm khóa học
│   │   └── Bulk actions
│   ├── Tạo khóa học mới
│   │   ├── Thông tin cơ bản
│   │   │   ├── Tiêu đề khóa học
│   │   │   ├── Mô tả chi tiết
│   │   │   ├── Mục tiêu khóa học
│   │   │   └── Thumbnail upload
│   │   ├── Cài đặt khóa học
│   │   │   ├── Danh mục
│   │   │   ├── Độ khó
│   │   │   ├── Slug URL
│   │   │   └── Trạng thái publish
│   │   └── SEO settings
│   ├── Chỉnh sửa khóa học
│   │   ├── Cập nhật thông tin
│   │   ├── Quản lý thumbnail
│   │   ├── Thay đổi danh mục
│   │   └── Cài đặt nâng cao
│   ├── Quản lý video bài học
│   │   ├── Danh sách video
│   │   ├── Thêm video mới
│   │   ├── Sắp xếp thứ tự
│   │   ├── Chỉnh sửa thông tin
│   │   └── Xóa video
│   ├── Thống kê khóa học
│   │   ├── Số lượng học viên
│   │   ├── Tỷ lệ hoàn thành
│   │   ├── Thời gian học trung bình
│   │   ├── Rating & feedback
│   │   └── Revenue tracking
│   └── Actions khóa học
│       ├── Publish/Unpublish
│       ├── Duplicate khóa học
│       ├── Archive khóa học
│       └── Delete khóa học
├── 🎥 Quản lý Video
│   ├── Tất cả video
│   │   ├── Video library
│   │   ├── Lọc theo khóa học
│   │   ├── Lọc theo trạng thái
│   │   └── Tìm kiếm video
│   ├── Upload video mới
│   │   ├── File upload với progress
│   │   ├── Video processing status
│   │   ├── Thumbnail generation
│   │   └── Quality settings
│   ├── Chỉnh sửa video
│   │   ├── Tiêu đề và mô tả
│   │   ├── Thời lượng video
│   │   ├── Thumbnail custom
│   │   ├── Thứ tự trong khóa học
│   │   └── Publish settings
│   ├── Thống kê video
│   │   ├── Lượt xem
│   │   ├── Thời gian xem trung bình
│   │   ├── Completion rate
│   │   └── Engagement metrics
│   └── Video processing
│       ├── Upload queue
│       ├── Processing status
│       ├── Error handling
│       └── Storage management
├── 📊 Báo cáo & Phân tích
│   ├── Dashboard analytics
│   │   ├── Key metrics overview
│   │   ├── Real-time statistics
│   │   └── Trend analysis
│   ├── Báo cáo học viên
│   │   ├── Enrollment trends
│   │   ├── Learning progress
│   │   ├── Completion rates
│   │   └── User engagement
│   ├── Báo cáo khóa học
│   │   ├── Course performance
│   │   ├── Popular content
│   │   ├── Video analytics
│   │   └── Drop-off analysis
│   ├── Báo cáo hệ thống
│   │   ├── Usage statistics
│   │   ├── Storage usage
│   │   ├── Bandwidth usage
│   │   └── Performance metrics
│   └── Custom reports
│       ├── Report builder
│       ├── Scheduled reports
│       ├── Export options
│       └── Data visualization
└── ⚙️ Cài đặt Hệ thống
    ├── Cài đặt chung
    │   ├── Site information
    │   ├── Email settings
    │   ├── Notification templates
    │   └── Feature toggles
    ├── User management
    │   ├── Role permissions
    │   ├── Access control
    │   └── Admin accounts
    ├── Storage settings
    │   ├── File upload limits
    │   ├── Video quality settings
    │   ├── CDN configuration
    │   └── Backup settings
    └── System maintenance
        ├── Cache management
        ├── Database optimization
        ├── Log monitoring
        └── Security settings
```

## User Flows MVP

### 1. Student Journey

#### A. Đăng ký và Khám phá

```
Landing Page → Xem khóa học featured →
Browse danh mục khóa học →
Xem chi tiết khóa học →
Click "Đăng ký học" →
Form đăng ký (email, password, tên) →
Xác thực email →
Hoàn thành profile cơ bản →
Dashboard welcome → Enrolled vào khóa học đầu tiên
```

#### B. Học tập và Theo dõi Tiến độ

```
Dashboard → Chọn khóa học đang học →
Xem danh sách video → Click video đầu tiên →
Xem video với player controls →
Điều chỉnh tốc độ/chất lượng →
Đánh dấu hoàn thành video →
Chuyển sang video tiếp theo →
Theo dõi tiến độ khóa học →
Hoàn thành tất cả video → Khóa học completed
```

#### C. Quản lý Học tập

```
Dashboard → Xem tiến độ tổng quan →
Check streak học tập →
Explore khóa học mới →
Enroll khóa học bổ sung →
Customize learning preferences →
Update profile information →
Review learning statistics
```

### 2. Admin Journey

#### A. Thiết lập Hệ thống

```
Admin Login → System overview dashboard →
Create categories → Add course information →
Upload course thumbnail → Create first lesson →
Upload lesson video → Set lesson order →
Review course content → Publish course →
Invite test students → Monitor engagement
```

#### B. Quản lý Nội dung

```
Dashboard → Check course performance →
Review student progress → Identify issues →
Update course content → Add new lessons →
Reorder lesson sequence → Update descriptions →
Monitor video analytics → Optimize content based on data
```

#### C. Phân tích và Báo cáo

```
Dashboard → View system analytics →
Generate student reports → Analyze course performance →
Identify popular content → Review completion rates →
Export data for further analysis →
Plan content improvements → Schedule regular reviews
```

### 3. Guest Journey

#### A. Khám phá Nền tảng

```
Landing page → Browse featured courses →
View course categories → Click course details →
Read course description → View lesson preview →
Check course objectives → Interested in learning →
Click "Enroll" → Redirect to registration →
Complete signup → Start learning journey
```

## Page Structure & Components

### Core Pages (All Users)

#### **Homepage (`/`)**

- Hero section với value proposition
- Featured courses carousel
- Categories showcase
- Platform statistics
- Student testimonials (future)
- CTA sections

#### **Course Catalog (`/courses`)**

- Course grid với filters
- Category filter sidebar
- Search functionality
- Sort options (newest, popular, rating)
- Pagination
- Course preview cards

#### **Course Details (`/courses/[slug]`)**

- Course overview & description
- Learning objectives
- Lesson list với durations
- Instructor information
- Student count & rating
- Enrollment CTA

#### **Category Pages (`/categories/[slug]`)**

- Category description
- Courses in category
- Sub-category navigation
- Related categories

#### **Authentication Pages**

- `/login` - Simple login form
- `/register` - Role-based registration
- `/forgot-password` - Password reset
- `/verify-email` - Email verification

### Student Pages

#### **Dashboard (`/dashboard`)**

- Learning progress overview
- Currently enrolled courses
- Completed courses
- Learning streak
- Recommended courses
- Recent activity

#### **My Courses (`/my-courses`)**

- Active enrollments
- Completed courses
- Dropped courses
- Progress tracking
- Continue learning CTAs

#### **Learning Interface (`/courses/[slug]/lessons/[lessonId]`)**

- Video player với controls
- Lesson navigation
- Progress indicator
- Note-taking (future)
- Resource downloads (future)

#### **Progress Tracking (`/progress`)**

- Overall learning statistics
- Course-specific progress
- Time spent learning
- Completion certificates (future)
- Achievement badges (future)

#### **Profile (`/profile`)**

- Personal information
- Avatar management
- Learning preferences
- Notification settings
- Account security

### Admin Pages

#### **Admin Dashboard (`/admin`)**

- System metrics overview
- Recent student activity
- Course performance data
- Quick action buttons
- System alerts

#### **Student Management (`/admin/students`)**

- Student list với search/filter
- Student detail views
- Progress monitoring
- Account management
- Bulk operations

#### **Category Management (`/admin/categories`)**

- Category CRUD interface
- Category hierarchy
- Usage statistics
- SEO settings

#### **Course Management (`/admin/courses`)**

- Course list với filters
- Course creation wizard
- Course editing interface
- Lesson management
- Publishing controls

#### **Analytics (`/admin/analytics`)**

- Learning analytics dashboard
- Course performance reports
- Student engagement metrics
- System usage statistics
- Custom report builder

## Key Components Architecture

### Shared Components

#### **Navigation Components**

```
├── Header/Navigation
│   ├── Logo & branding
│   ├── Main navigation menu
│   ├── Course search bar
│   ├── User menu dropdown
│   └── Mobile menu toggle
├── Footer
│   ├── Quick links
│   ├── Contact information
│   └── Legal links
└── Breadcrumbs
    ├── Course navigation
    └── Lesson progress
```

#### **Course Components**

```
├── Course Card
│   ├── Course thumbnail
│   ├── Title & description
│   ├── Category badge
│   ├── Duration & lesson count
│   ├── Student count
│   ├── Progress bar (enrolled)
│   └── Enroll/Continue button
├── Course Details
│   ├── Course overview
│   ├── Learning objectives
│   ├── Lesson list
│   ├── Prerequisites
│   └── Enrollment CTA
└── Lesson Components
    ├── Video player với controls
    ├── Lesson navigation
    ├── Progress tracking
    ├── Completion marking
    └── Next lesson CTA
```

#### **Progress Components**

```
├── Progress Indicators
│   ├── Course progress bars
│   ├── Lesson completion checkmarks
│   ├── Overall learning progress
│   └── Time-based progress
├── Dashboard Widgets
│   ├── Learning statistics cards
│   ├── Recent activity feed
│   ├── Course recommendations
│   └── Achievement displays
└── Analytics Charts
    ├── Progress over time
    ├── Course completion rates
    ├── Learning time distribution
    └── Engagement metrics
```

#### **Form Components**

```
├── Input Components
│   ├── Text inputs với validation
│   ├── Rich text editor (course descriptions)
│   ├── File upload (videos, thumbnails)
│   ├── Category selectors
│   └── Toggle switches
├── Video Upload
│   ├── Drag & drop interface
│   ├── Upload progress tracking
│   ├── Video preview
│   └── Processing status
└── Course Builder
    ├── Step-by-step wizard
    ├── Lesson reordering
    ├── Content validation
    └── Preview functionality
```

### Role-specific Components

#### **Student Components**

```
├── Learning Interface
│   ├── Video player với advanced controls
│   ├── Playback speed controls
│   ├── Quality selection
│   ├── Fullscreen support
│   └── Keyboard shortcuts
├── Progress Tracking
│   ├── Course progress dashboard
│   ├── Learning streak counter
│   ├── Time tracking
│   ├── Completion certificates
│   └── Goal setting
└── Course Discovery
    ├── Personalized recommendations
    ├── Advanced search filters
    ├── Wishlist functionality
    └── Learning path suggestions
```

#### **Admin Components**

```
├── Content Management
│   ├── Course creation wizard
│   ├── Lesson management interface
│   ├── Bulk content operations
│   ├── Content publishing workflow
│   └── Version control (future)
├── Analytics Dashboard
│   ├── Real-time metrics
│   ├── Student progress monitoring
│   ├── Course performance analytics
│   ├── Engagement heatmaps
│   └── Custom report builder
├── User Management
│   ├── Student list với advanced filters
│   ├── Role assignment interface
│   ├── Bulk user operations
│   ├── Account status management
│   └── Communication tools
└── System Administration
    ├── Category management
    ├── Settings configuration
    ├── File storage management
    ├── Email template editor
    └── System monitoring
```

## MVP Feature Mapping & Priorities

### Phase 1 - Foundation (Week 1-2)

**Core Infrastructure & Basic Learning**

```
✅ Essential Features (Must Have)
├── Authentication system (register/login/logout)
├── User profiles (student/admin)
├── Category management
├── Basic course CRUD
├── Video upload và storage
├── Course enrollment system

📊 Success Metrics:
├── User registration success rate > 90%
├── Video upload success rate > 95%
├── Course creation completion > 80%
└── Page load times < 2 seconds
```

### Phase 2 - Learning Experience (Week 3-4)

**Video Player & Progress Tracking**

```
✅ Essential Features (Must Have)
├── Video player với controls
├── Lesson progress tracking
├── Course completion system
├── Student dashboard
├── Admin analytics dashboard
└── Responsive design

📊 Success Metrics:
├── Video completion rate > 70%
├── Course completion rate > 40%
├── Mobile usage compatibility
└── User session time > 15 minutes
```

### Phase 3 - Management & Analytics (Week 5-6)

**Admin Tools & Optimization**

```
✅ Essential Features (Must Have)
├── Student management system
├── Course analytics và reporting
├── Content management workflow
├── Search và filter functionality
├── Email notifications
└── Performance optimizations

📊 Success Metrics:
├── Admin efficiency improvement > 50%
├── Search usage > 30% of sessions
├── Email engagement rate > 25%
└── System uptime > 99%
```

### Future Enhancements (Post-MVP)

**Advanced Features**

```
🚀 Future Features (Could Have)
├── Advanced video features (captions, bookmarks)
├── Interactive elements (quizzes, assignments)
├── Certificates và badges
├── Discussion forums
├── Mobile apps
├── Advanced analytics và AI recommendations
├── Multi-language support
├── API for integrations
└── White-label solutions
```

## Technical Implementation Details

### Database Integration Mapping

```
Database Tables → UI Components
├── profiles → UserProfile, Dashboard, Settings
├── categories → CategoryFilter, CategoryManager
├── courses → CourseCard, CourseDetails, CourseBuilder
├── lessons → LessonPlayer, LessonList, LessonManager
├── enrollments → EnrollmentTracker, StudentDashboard
├── lesson_progress → ProgressBar, ProgressAnalytics
└── Storage Buckets → VideoPlayer, FileUploader, ThumbnailManager
```

### State Management Architecture

```
Query Keys Structure:
├── auth: ['auth', 'profile']
├── courses: ['courses', filters] | ['courses', 'detail', courseId]
├── categories: ['categories']
├── enrollments: ['enrollments', studentId]
├── progress: ['progress', studentId, courseId]
├── lessons: ['lessons', courseId]
└── analytics: ['analytics', 'dashboard', role]

Cache Strategies:
├── Static Data (10+ minutes): categories
├── Course Data (5 minutes): course lists, details
├── User Data (2 minutes): enrollments, progress
└── Real-time Data (30 seconds): dashboard stats
```

### Performance Optimizations

```
├── Video streaming optimization
├── Image optimization với next/image
├── Progressive loading for course lists
├── Efficient video player với HLS support
├── Cache strategies for static content
└── Mobile-first responsive design
```

## Data Flow Architecture

### Course Enrollment Flow

```
Course Discovery → Course Details → Enrollment Decision →
Registration (if needed) → Enrollment Confirmation →
Dashboard Update → First Lesson Access
```

### Learning Progress Flow

```
Lesson Selection → Video Loading → Progress Tracking →
Completion Marking → Next Lesson Suggestion →
Course Progress Update → Dashboard Analytics Update
```

### Content Creation Flow

```
Admin Login → Course Creation → Lesson Addition →
Video Upload → Content Review → Publishing →
Student Notification → Analytics Tracking
```

### Video Processing Flow

```
Video Upload → Processing Queue → Quality Optimization →
Thumbnail Generation → Storage Management →
URL Generation → Player Integration → Analytics Setup
```
