export const LABELS = {
  // User Roles
  USER_ROLES: {
    student: 'Học viên',
    admin: 'Quản trị viên',
  },

  // Enrollment Status
  ENROLLMENT_STATUS: {
    active: 'Đang học',
    completed: 'Đã hoàn thành',
    dropped: 'Đã bỏ học',
  },

  // Lesson Types
  LESSON_TYPES: {
    video: 'Video',
  },

  // Table Names
  TABLES: {
    profiles: 'Hồ sơ người dùng',
    categories: 'Danh mục',
    courses: 'Khóa học',
    lessons: 'Bài học',
    enrollments: 'Đăng ký học',
    lesson_progress: 'Tiến độ bài học',
  },

  // Profile Fields
  PROFILE: {
    id: 'ID',
    email: 'Email',
    full_name: 'Họ và tên',
    avatar_url: 'Ảnh đại diện',
    role: 'Vai trò',
    created_at: 'Ngày tạo',
    updated_at: 'Ngày cập nhật',
  },

  // Category Fields
  CATEGORY: {
    id: 'ID',
    name: 'Tên danh mục',
    description: 'Mô tả',
    slug: 'Đường dẫn',
    created_at: 'Ngày tạo',
    updated_at: 'Ngày cập nhật',
  },

  // Course Fields
  COURSE: {
    id: 'ID',
    title: 'Tiêu đề khóa học',
    description: 'Mô tả khóa học',
    objectives: 'Mục tiêu học tập',
    thumbnail_url: 'Ảnh thumbnail',
    slug: 'Đường dẫn',
    category_id: 'Danh mục',
    is_published: 'Đã xuất bản',
    created_at: 'Ngày tạo',
    updated_at: 'Ngày cập nhật',
  },

  // Lesson Fields
  LESSON: {
    id: 'ID',
    course_id: 'Khóa học',
    title: 'Tiêu đề bài học',
    description: 'Mô tả bài học',
    lesson_type: 'Loại bài học',
    video_url: 'Đường dẫn video',
    duration_seconds: 'Thời lượng (giây)',
    order_index: 'Thứ tự',
    is_published: 'Đã xuất bản',
    created_at: 'Ngày tạo',
    updated_at: 'Ngày cập nhật',
  },

  // Enrollment Fields
  ENROLLMENT: {
    id: 'ID',
    student_id: 'Học viên',
    course_id: 'Khóa học',
    status: 'Trạng thái',
    enrolled_at: 'Ngày đăng ký',
    completed_at: 'Ngày hoàn thành',
  },

  // Lesson Progress Fields
  LESSON_PROGRESS: {
    id: 'ID',
    student_id: 'Học viên',
    lesson_id: 'Bài học',
    enrollment_id: 'Đăng ký học',
    watched_seconds: 'Thời gian đã xem (giây)',
    completed_at: 'Ngày hoàn thành',
    last_watched_at: 'Lần xem cuối',
  },

  // Common UI Labels
  UI: {
    // Actions
    create: 'Tạo mới',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    submit: 'Gửi',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    sort: 'Sắp xếp',
    view: 'Xem',
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước đó',
    finish: 'Hoàn thành',
    start: 'Bắt đầu',
    continue: 'Tiếp tục',
    pause: 'Tạm dừng',
    play: 'Phát',
    upload: 'Tải lên',
    download: 'Tải xuống',
    
    // Status
    active: 'Đang hoạt động',
    inactive: 'Không hoạt động',
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    pending: 'Đang chờ',
    processing: 'Đang xử lý',
    completed: 'Đã hoàn thành',
    failed: 'Thất bại',
    
    // Messages
    loading: 'Đang tải...',
    no_data: 'Không có dữ liệu',
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'Thông tin',
    
    // Navigation
    home: 'Trang chủ',
    dashboard: 'Bảng điều khiển',
    courses: 'Khóa học',
    lessons: 'Bài học',
    students: 'Học viên',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    
    // Time
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    this_week: 'Tuần này',
    this_month: 'Tháng này',
    this_year: 'Năm này',
    
    // Quantity
    total: 'Tổng cộng',
    count: 'Số lượng',
    percentage: 'Phần trăm',
    progress: 'Tiến độ',
    duration: 'Thời lượng',
    
    // Forms
    required: 'Bắt buộc',
    optional: 'Tùy chọn',
    invalid: 'Không hợp lệ',
    valid: 'Hợp lệ',
    
    // Pagination
    page: 'Trang',
    per_page: 'Mỗi trang',
    total_pages: 'Tổng số trang',
    showing: 'Hiển thị',
    of: 'của',
    results: 'kết quả',
  },

  // Course Management
  COURSE_MANAGEMENT: {
    my_courses: 'Khóa học của tôi',
    all_courses: 'Tất cả khóa học',
    enrolled_courses: 'Khóa học đã đăng ký',
    completed_courses: 'Khóa học đã hoàn thành',
    in_progress_courses: 'Khóa học đang học',
    available_courses: 'Khóa học có sẵn',
    course_details: 'Chi tiết khóa học',
    course_content: 'Nội dung khóa học',
    course_objectives: 'Mục tiêu khóa học',
    course_description: 'Mô tả khóa học',
    enroll_now: 'Đăng ký ngay',
    start_course: 'Bắt đầu học',
    continue_course: 'Tiếp tục học',
    complete_course: 'Hoàn thành khóa học',
  },

  // Learning
  LEARNING: {
    watch_video: 'Xem video',
    mark_complete: 'Đánh dấu hoàn thành',
    lesson_completed: 'Bài học đã hoàn thành',
    course_progress: 'Tiến độ khóa học',
    current_lesson: 'Bài học hiện tại',
    next_lesson: 'Bài học tiếp theo',
    previous_lesson: 'Bài học trước',
    lesson_list: 'Danh sách bài học',
    video_duration: 'Thời lượng video',
    watched_time: 'Thời gian đã xem',
    remaining_time: 'Thời gian còn lại',
  },

  // Admin
  ADMIN: {
    admin_panel: 'Bảng quản trị',
    user_management: 'Quản lý người dùng',
    course_management: 'Quản lý khóa học',
    category_management: 'Quản lý danh mục',
    lesson_management: 'Quản lý bài học',
    enrollment_management: 'Quản lý đăng ký',
    reports: 'Báo cáo',
    statistics: 'Thống kê',
    system_settings: 'Cài đặt hệ thống',
    
    // Statistics
    total_users: 'Tổng số người dùng',
    total_students: 'Tổng số học viên',
    total_courses: 'Tổng số khóa học',
    total_lessons: 'Tổng số bài học',
    total_enrollments: 'Tổng số đăng ký',
    active_students: 'Học viên đang hoạt động',
    completed_students: 'Học viên đã hoàn thành',
    average_progress: 'Tiến độ trung bình',
    completion_rate: 'Tỷ lệ hoàn thành',
  },

  // Errors
  ERRORS: {
    required_field: 'Trường này là bắt buộc',
    invalid_email: 'Email không hợp lệ',
    password_too_short: 'Mật khẩu quá ngắn',
    passwords_not_match: 'Mật khẩu không khớp',
    invalid_format: 'Định dạng không hợp lệ',
    file_too_large: 'File quá lớn',
    invalid_file_type: 'Loại file không được hỗ trợ',
    network_error: 'Lỗi kết nối mạng',
    server_error: 'Lỗi máy chủ',
    unauthorized: 'Không có quyền truy cập',
    not_found: 'Không tìm thấy',
    forbidden: 'Bị cấm truy cập',
  },

  // Success Messages
  SUCCESS: {
    created: 'Tạo thành công',
    updated: 'Cập nhật thành công',
    deleted: 'Xóa thành công',
    uploaded: 'Tải lên thành công',
    saved: 'Lưu thành công',
    enrolled: 'Đăng ký thành công',
    completed: 'Hoàn thành thành công',
    login: 'Đăng nhập thành công',
    logout: 'Đăng xuất thành công',
    registered: 'Đăng ký tài khoản thành công',
  },
} as const;

// Type helpers for TypeScript
export type UserRole = keyof typeof LABELS.USER_ROLES;
export type EnrollmentStatus = keyof typeof LABELS.ENROLLMENT_STATUS;
export type LessonType = keyof typeof LABELS.LESSON_TYPES;

// Helper functions
export const getUserRoleLabel = (role: UserRole): string => {
  return LABELS.USER_ROLES[role] || role;
};

export const getEnrollmentStatusLabel = (status: EnrollmentStatus): string => {
  return LABELS.ENROLLMENT_STATUS[status] || status;
};

export const getLessonTypeLabel = (type: LessonType): string => {
  return LABELS.LESSON_TYPES[type] || type;
};

// Format duration from seconds to readable format
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Default export
export default LABELS;
