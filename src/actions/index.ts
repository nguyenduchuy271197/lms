// Authentication Actions
export * from "./auth/register"
export * from "./auth/login"
export * from "./auth/logout"

// User Actions
export * from "./users/get-profile"
export * from "./users/update-profile"
export * from "./users/change-role"

// Category Actions
export * from "./categories/get-categories"
export * from "./categories/get-category"
export * from "./categories/create-category"
export * from "./categories/update-category"
export * from "./categories/delete-category"

// Course Actions
export * from "./courses/get-courses"
export * from "./courses/get-course"
export * from "./courses/get-course-by-slug"
export * from "./courses/create-course"
export * from "./courses/update-course"
export * from "./courses/delete-course"
export * from "./courses/publish-course"

// Lesson Actions
export * from "./lessons/get-lessons-by-course"
export * from "./lessons/get-lesson"
export * from "./lessons/create-lesson"
export * from "./lessons/update-lesson"
export * from "./lessons/delete-lesson"
export * from "./lessons/publish-lesson"
export * from "./lessons/reorder-lessons"

// File Management Actions
export * from "./files/upload-video"
export * from "./files/upload-thumbnail"
export * from "./files/upload-avatar"
export * from "./files/delete-video"
export * from "./files/delete-thumbnail"
export * from "./files/get-file-url"
export * from "./files/get-video-metadata"
export * from "./files/process-video"

// Enrollment Actions
export * from "./enrollments/get-my-enrollments"
export * from "./enrollments/get-enrollment"
export * from "./enrollments/get-enrollments-by-course"
export * from "./enrollments/create-enrollment"
export * from "./enrollments/update-enrollment-status"
export * from "./enrollments/delete-enrollment"
export * from "./enrollments/check-enrollment"

// Lesson Progress Actions
export * from "./lesson-progress/get-my-lesson-progress"
export * from "./lesson-progress/get-lesson-progress"
export * from "./lesson-progress/get-lesson-progress-by-lesson"
export * from "./lesson-progress/update-lesson-progress"
export * from "./lesson-progress/mark-lesson-complete"
export * from "./lesson-progress/mark-lesson-incomplete"
export * from "./lesson-progress/get-course-progress"
export * from "./lesson-progress/reset-lesson-progress"

// User Management Actions
export * from "./user-management/get-all-users"
export * from "./user-management/get-user-by-id"
export * from "./user-management/update-user-profile"
export * from "./user-management/delete-user"
export * from "./user-management/get-user-statistics"
export * from "./user-management/get-user-enrollments"
export * from "./user-management/get-user-activity"
export * from "./user-management/bulk-action"
export * from "./user-management/export-user-data"

// Admin Course Management Actions
export * from "./admin/courses/get-all-courses"
export * from "./admin/courses/get-course-analytics"
export * from "./admin/courses/bulk-update-courses"
export * from "./admin/courses/export-courses"
export * from "./admin/courses/get-course-engagement"
export * from "./admin/courses/get-popular-courses"
export * from "./admin/courses/get-completion-rates"

// Admin Student Management Actions
export * from "./admin/students/get-all-students"
export * from "./admin/students/get-student-details"
export * from "./admin/students/get-student-progress"
export * from "./admin/students/get-student-enrollments"
export * from "./admin/students/get-student-analytics"
export * from "./admin/students/export-student-data"
export * from "./admin/students/get-learning-path"
export * from "./admin/students/reset-student-progress"