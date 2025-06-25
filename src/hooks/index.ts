// Authentication Hooks
export * from "./auth/use-register"
export * from "./auth/use-login"
export * from "./auth/use-logout"

// User Hooks
export * from "./users/use-profile"
export * from "./users/use-update-profile"
export * from "./users/use-change-role"

// Category Hooks
export * from "./categories/use-categories"
export * from "./categories/use-category"
export * from "./categories/use-create-category"
export * from "./categories/use-update-category"
export * from "./categories/use-delete-category"

// Course Hooks
export * from "./courses/use-courses"
export * from "./courses/use-course"
export * from "./courses/use-course-by-slug"
export * from "./courses/use-create-course"
export * from "./courses/use-update-course"
export * from "./courses/use-delete-course"
export * from "./courses/use-publish-course"

// Lesson Hooks
export * from "./lessons/use-lessons-by-course"
export * from "./lessons/use-lesson"
export * from "./lessons/use-create-lesson"
export * from "./lessons/use-update-lesson"
export * from "./lessons/use-delete-lesson"
export * from "./lessons/use-publish-lesson"
export * from "./lessons/use-reorder-lessons"

// File Management Hooks
export * from "./files/use-upload-thumbnail"
export * from "./files/use-upload-avatar"

// Enrollment Hooks
export * from "./enrollments/use-my-enrollments"
export * from "./enrollments/use-enrollment"
export * from "./enrollments/use-enrollments-by-course"
export * from "./enrollments/use-create-enrollment"
export * from "./enrollments/use-update-enrollment-status"
export * from "./enrollments/use-delete-enrollment"
export * from "./enrollments/use-check-enrollment"

// Lesson Progress Hooks
export * from "./lesson-progress/use-my-lesson-progress"
export * from "./lesson-progress/use-lesson-progress"
export * from "./lesson-progress/use-update-lesson-progress"
export * from "./lesson-progress/use-mark-lesson-complete"
export * from "./lesson-progress/use-course-progress"

// User Management Hooks
export * from "./user-management/use-all-users"
export * from "./user-management/use-user-by-id"
export * from "./user-management/use-update-user-profile"
export * from "./user-management/use-delete-user"
export * from "./user-management/use-bulk-action"



// Admin Student Management Hooks
export * from "./admin/students/use-all-students"
export * from "./admin/students/use-student-details"
export * from "./admin/students/use-student-progress"

// Utility Hooks
export * from "./use-mobile"