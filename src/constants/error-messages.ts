// Authentication Error Messages
export const AUTH_ERRORS = {
  // General
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Bạn không được phép thực hiện hành động này',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
  
  // Login
  LOGIN_REQUIRED: 'Vui lòng đăng nhập để tiếp tục',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  EMAIL_NOT_FOUND: 'Email không tồn tại trong hệ thống',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
  
  // Registration
  REGISTRATION_FAILED: 'Đăng ký thất bại',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
  WEAK_PASSWORD: 'Mật khẩu phải có ít nhất 6 ký tự',
  INVALID_EMAIL: 'Email không hợp lệ',
  
  // Password
  PASSWORD_RESET_FAILED: 'Không thể đặt lại mật khẩu',
  PASSWORD_UPDATE_FAILED: 'Cập nhật mật khẩu thất bại',
  CURRENT_PASSWORD_INCORRECT: 'Mật khẩu hiện tại không chính xác',
  
  // Profile
  PROFILE_UPDATE_FAILED: 'Cập nhật thông tin cá nhân thất bại',
  PROFILE_NOT_FOUND: 'Không tìm thấy thông tin người dùng',
  
  // Role & Permission
  ADMIN_REQUIRED: 'Chỉ admin mới có quyền thực hiện',
  STUDENT_REQUIRED: 'Chỉ học viên mới có quyền thực hiện',
  INSUFFICIENT_PERMISSIONS: 'Bạn không có đủ quyền hạn',
} as const

// Course Error Messages
export const COURSE_ERRORS = {
  // General
  COURSE_NOT_FOUND: 'Không tìm thấy khóa học',
  COURSE_ACCESS_DENIED: 'Bạn không có quyền truy cập khóa học này',
  COURSE_UNAVAILABLE: 'Khóa học hiện không khả dụng',
  
  // Creation & Update
  COURSE_CREATE_FAILED: 'Tạo khóa học thất bại',
  COURSE_UPDATE_FAILED: 'Cập nhật khóa học thất bại',
  COURSE_DELETE_FAILED: 'Xóa khóa học thất bại',
  
  // Validation
  COURSE_TITLE_REQUIRED: 'Tiêu đề khóa học là bắt buộc',
  COURSE_SLUG_REQUIRED: 'Slug khóa học là bắt buộc',
  COURSE_SLUG_EXISTS: 'Slug khóa học đã tồn tại',
  COURSE_CATEGORY_REQUIRED: 'Danh mục khóa học là bắt buộc',
  
  // Publishing
  COURSE_PUBLISH_FAILED: 'Xuất bản khóa học thất bại',
  COURSE_UNPUBLISH_FAILED: 'Hủy xuất bản khóa học thất bại',
  COURSE_NOT_READY: 'Khóa học chưa có đủ thông tin để xuất bản (cần có tiêu đề và mô tả)',
} as const

// Lesson Error Messages
export const LESSON_ERRORS = {
  // General
  LESSON_NOT_FOUND: 'Không tìm thấy bài học',
  LESSON_ACCESS_DENIED: 'Bạn không có quyền truy cập bài học này',
  LESSON_UNAVAILABLE: 'Bài học hiện không khả dụng',
  
  // Creation & Update
  LESSON_CREATE_FAILED: 'Tạo bài học thất bại',
  LESSON_UPDATE_FAILED: 'Cập nhật bài học thất bại',
  LESSON_DELETE_FAILED: 'Xóa bài học thất bại',
  
  // Validation
  LESSON_TITLE_REQUIRED: 'Tiêu đề bài học là bắt buộc',
  LESSON_ORDER_REQUIRED: 'Thứ tự bài học là bắt buộc',
  LESSON_ORDER_EXISTS: 'Thứ tự bài học đã tồn tại',
  LESSON_VIDEO_REQUIRED: 'Video bài học là bắt buộc',
  LESSON_DURATION_INVALID: 'Thời lượng bài học không hợp lệ',
  
  // Progress
  LESSON_PROGRESS_UPDATE_FAILED: 'Cập nhật tiến độ bài học thất bại',
  LESSON_COMPLETION_FAILED: 'Đánh dấu hoàn thành bài học thất bại',
} as const

// Enrollment Error Messages
export const ENROLLMENT_ERRORS = {
  // General
  ENROLLMENT_NOT_FOUND: 'Không tìm thấy thông tin ghi danh',
  ENROLLMENT_ACCESS_DENIED: 'Bạn không có quyền truy cập thông tin ghi danh này',
  
  // Enrollment Actions
  ENROLLMENT_FAILED: 'Ghi danh khóa học thất bại',
  ALREADY_ENROLLED: 'Bạn đã ghi danh khóa học này',
  ENROLLMENT_CANCELLED: 'Ghi danh đã bị hủy',
  ENROLLMENT_COMPLETED: 'Khóa học đã hoàn thành',
  
  // Unenrollment
  UNENROLLMENT_FAILED: 'Hủy ghi danh thất bại',
  CANNOT_UNENROLL: 'Không thể hủy ghi danh khóa học này',
  
  // Status
  ENROLLMENT_STATUS_UPDATE_FAILED: 'Cập nhật trạng thái ghi danh thất bại',
  INVALID_ENROLLMENT_STATUS: 'Trạng thái ghi danh không hợp lệ',
} as const

// Category Error Messages
export const CATEGORY_ERRORS = {
  // General
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục',
  
  // Creation & Update
  CATEGORY_CREATE_FAILED: 'Tạo danh mục thất bại',
  CATEGORY_UPDATE_FAILED: 'Cập nhật danh mục thất bại',
  CATEGORY_DELETE_FAILED: 'Xóa danh mục thất bại',
  
  // Validation
  CATEGORY_NAME_REQUIRED: 'Tên danh mục là bắt buộc',
  CATEGORY_SLUG_REQUIRED: 'Slug danh mục là bắt buộc',
  CATEGORY_NAME_EXISTS: 'Tên danh mục đã tồn tại',
  CATEGORY_SLUG_EXISTS: 'Slug danh mục đã tồn tại',
  
  // Dependencies
  CATEGORY_HAS_COURSES: 'Không thể xóa danh mục có chứa khóa học',
} as const

// File Upload Error Messages
export const UPLOAD_ERRORS = {
  // General
  UPLOAD_FAILED: 'Tải file lên thất bại',
  FILE_TOO_LARGE: 'File quá lớn',
  INVALID_FILE_TYPE: 'Loại file không được hỗ trợ',
  
  // Specific Files
  VIDEO_UPLOAD_FAILED: 'Tải video lên thất bại',
  IMAGE_UPLOAD_FAILED: 'Tải hình ảnh lên thất bại',
  AVATAR_UPLOAD_FAILED: 'Tải avatar lên thất bại',
  
  // Validation
  FILE_REQUIRED: 'Vui lòng chọn file',
  VIDEO_FORMAT_INVALID: 'Định dạng video không hợp lệ',
  IMAGE_FORMAT_INVALID: 'Định dạng hình ảnh không hợp lệ',
  
  // Storage
  STORAGE_QUOTA_EXCEEDED: 'Đã vượt quá dung lượng cho phép',
  STORAGE_ACCESS_DENIED: 'Không có quyền truy cập storage',
} as const

// Database Error Messages
export const DATABASE_ERRORS = {
  // General
  DATABASE_ERROR: 'Lỗi cơ sở dữ liệu',
  CONNECTION_FAILED: 'Kết nối cơ sở dữ liệu thất bại',
  QUERY_FAILED: 'Truy vấn cơ sở dữ liệu thất bại',
  
  // Constraints
  FOREIGN_KEY_CONSTRAINT: 'Vi phạm ràng buộc khóa ngoại',
  UNIQUE_CONSTRAINT: 'Giá trị đã tồn tại',
  NOT_NULL_CONSTRAINT: 'Trường bắt buộc không được để trống',
  
  // Transactions
  TRANSACTION_FAILED: 'Giao dịch thất bại',
  ROLLBACK_FAILED: 'Rollback thất bại',
} as const

// Validation Error Messages
export const VALIDATION_ERRORS = {
  // Required Fields
  FIELD_REQUIRED: 'Trường này là bắt buộc',
  EMAIL_REQUIRED: 'Email là bắt buộc',
  PASSWORD_REQUIRED: 'Mật khẩu là bắt buộc',
  NAME_REQUIRED: 'Tên là bắt buộc',
  
  // Format Validation
  INVALID_EMAIL_FORMAT: 'Định dạng email không hợp lệ',
  INVALID_PASSWORD_FORMAT: 'Mật khẩu phải có ít nhất 6 ký tự',
  INVALID_URL_FORMAT: 'Định dạng URL không hợp lệ',
  INVALID_SLUG_FORMAT: 'Slug chỉ được chứa chữ cài, số và dấu gạch ngang',
  
  // Length Validation
  NAME_TOO_SHORT: 'Tên quá ngắn (tối thiểu 2 ký tự)',
  NAME_TOO_LONG: 'Tên quá dài (tối đa 100 ký tự)',
  DESCRIPTION_TOO_LONG: 'Mô tả quá dài (tối đa 1000 ký tự)',
  
  // Number Validation
  INVALID_NUMBER: 'Giá trị phải là số',
  NUMBER_TOO_SMALL: 'Giá trị quá nhỏ',
  NUMBER_TOO_LARGE: 'Giá trị quá lớn',
} as const

// Network Error Messages
export const NETWORK_ERRORS = {
  // Connection
  CONNECTION_ERROR: 'Lỗi kết nối mạng',
  TIMEOUT_ERROR: 'Hết thời gian chờ',
  OFFLINE_ERROR: 'Không có kết nối internet',
  
  // Server
  SERVER_ERROR: 'Lỗi máy chủ',
  SERVICE_UNAVAILABLE: 'Dịch vụ không khả dụng',
  MAINTENANCE_MODE: 'Hệ thống đang bảo trì',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
  TOO_MANY_REQUESTS: 'Bạn đã gửi quá nhiều yêu cầu',
} as const

// Generic Error Messages
export const GENERIC_ERRORS = {
  SOMETHING_WENT_WRONG: 'Có lỗi xảy ra, vui lòng thử lại',
  OPERATION_FAILED: 'Thao tác thất bại',
  PLEASE_TRY_AGAIN: 'Vui lòng thử lại',
  CONTACT_SUPPORT: 'Vui lòng liên hệ hỗ trợ',
  
  // Form
  FORM_VALIDATION_ERROR: 'Vui lòng kiểm tra lại thông tin',
  FORM_SUBMIT_ERROR: 'Gửi form thất bại',
  
  // Loading
  LOADING_ERROR: 'Tải dữ liệu thất bại',
  REFRESH_ERROR: 'Làm mới dữ liệu thất bại',
} as const

// Helper function to get error message
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return GENERIC_ERRORS.SOMETHING_WENT_WRONG
}

// Helper function to check if error is specific type
export function isAuthError(error: string): boolean {
  return Object.values(AUTH_ERRORS).includes(error as typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS])
}

export function isCourseError(error: string): boolean {
  return Object.values(COURSE_ERRORS).includes(error as typeof COURSE_ERRORS[keyof typeof COURSE_ERRORS])
}

export function isLessonError(error: string): boolean {
  return Object.values(LESSON_ERRORS).includes(error as typeof LESSON_ERRORS[keyof typeof LESSON_ERRORS])
}

export function isValidationError(error: string): boolean {
  return Object.values(VALIDATION_ERRORS).includes(error as typeof VALIDATION_ERRORS[keyof typeof VALIDATION_ERRORS])
}

export function isNetworkError(error: string): boolean {
  return Object.values(NETWORK_ERRORS).includes(error as typeof NETWORK_ERRORS[keyof typeof NETWORK_ERRORS])
}

// Export all error messages
export const ERROR_MESSAGES = {
  AUTH: AUTH_ERRORS,
  COURSE: COURSE_ERRORS,
  LESSON: LESSON_ERRORS,
  ENROLLMENT: ENROLLMENT_ERRORS,
  CATEGORY: CATEGORY_ERRORS,
  UPLOAD: UPLOAD_ERRORS,
  DATABASE: DATABASE_ERRORS,
  VALIDATION: VALIDATION_ERRORS,
  NETWORK: NETWORK_ERRORS,
  GENERIC: GENERIC_ERRORS,
} as const
