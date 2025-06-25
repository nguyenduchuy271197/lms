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
export * from "./files/upload-thumbnail"
export * from "./files/upload-avatar"

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
export * from "./lesson-progress/update-lesson-progress"
export * from "./lesson-progress/mark-lesson-complete"
export * from "./lesson-progress/get-course-progress"

// User Management Actions
export * from "./user-management/get-all-users"
export * from "./user-management/get-user-by-id"
export * from "./user-management/update-user-profile"
export * from "./user-management/delete-user"
export * from "./user-management/bulk-action"



// Admin Student Management Actions
export * from "./admin/students/get-all-students"
export * from "./admin/students/get-student-details"
export * from "./admin/students/get-student-progress"
