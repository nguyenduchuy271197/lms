# LMS - Complete Actions & Hooks Implementation

---

## 🔐 **Authentication & Users**

| Feature        | Action                                          | Hook                          | Type     | Priority | Dependencies |
| -------------- | ----------------------------------------------- | ----------------------------- | -------- | -------- | ------------ |
| Register       | `auth/register.ts` → `registerUser`             | `auth/use-register.ts`        | Mutation | Cao      | None         |
| Login          | `auth/login.ts` → `loginUser`                   | `auth/use-login.ts`           | Mutation | Cao      | FR01         |
| Logout         | `auth/logout.ts` → `logoutUser`                 | `auth/use-logout.ts`          | Mutation | Cao      | FR02         |
| Get Profile    | `users/get-profile.ts` → `getUserProfile`       | `users/use-profile.ts`        | Query    | Cao      | FR02         |
| Update Profile | `users/update-profile.ts` → `updateUserProfile` | `users/use-update-profile.ts` | Mutation | Cao      | FR03         |
| Upload Avatar  | `users/upload-avatar.ts` → `uploadAvatar`       | `users/use-upload-avatar.ts`  | Mutation | Cao      | FR03         |
| Change Role    | `users/change-role.ts` → `changeUserRole`       | `users/use-change-role.ts`    | Mutation | Cao      | Admin only   |

---

## 🗂️ **Categories Management**

| Feature         | Action                                             | Hook                                | Type     | Priority | Dependencies |
| --------------- | -------------------------------------------------- | ----------------------------------- | -------- | -------- | ------------ |
| Get Categories  | `categories/get-categories.ts` → `getCategories`   | `categories/use-categories.ts`      | Query    | Cao      | None         |
| Create Category | `categories/create-category.ts` → `createCategory` | `categories/use-create-category.ts` | Mutation | Cao      | Admin only   |
| Update Category | `categories/update-category.ts` → `updateCategory` | `categories/use-update-category.ts` | Mutation | Cao      | Admin only   |
| Delete Category | `categories/delete-category.ts` → `deleteCategory` | `categories/use-delete-category.ts` | Mutation | Cao      | Admin only   |

---

## 📚 **Courses Management**

| Feature                     | Action                                                         | Hook                               | Type     | Priority   | Dependencies |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------- | -------- | ---------- | ------------ |
| Get Courses                 | `courses/get-courses.ts` → `getCourses`                        | `courses/use-courses.ts`           | Query    | Cao        | FR04         |
| Get Course Details          | `courses/get-course.ts` → `getCourseDetails`                   | `courses/use-course.ts`            | Query    | Cao        | FR05         |
| Search Courses              | `courses/search-courses.ts` → `searchCourses`                  | `courses/use-search-courses.ts`    | Query    | Cao        | FR06         |
| Create Course               | `courses/create-course.ts` → `createCourse`                    | `courses/use-create-course.ts`     | Mutation | Cao        | FR15         |
| Update Course               | `courses/update-course.ts` → `updateCourse`                    | `courses/use-update-course.ts`     | Mutation | Cao        | FR16         |
| Delete Course               | `courses/delete-course.ts` → `deleteCourse`                    | `courses/use-delete-course.ts`     | Mutation | Cao        | FR17         |
| Upload Course Thumbnail     | `courses/upload-thumbnail.ts` → `uploadCourseThumbnail`        | `courses/use-upload-thumbnail.ts`  | Mutation | Trung bình | FR15         |
| Publish Course              | `courses/publish-course.ts` → `publishCourse`                  | `courses/use-publish-course.ts`    | Mutation | Cao        | FR15         |
| Unpublish Course            | `courses/unpublish-course.ts` → `unpublishCourse`              | `courses/use-unpublish-course.ts`  | Mutation | Cao        | FR15         |
| Get Course Statistics       | `courses/get-course-statistics.ts` → `getCourseStatistics`     | `courses/use-course-statistics.ts` | Query    | Trung bình | FR25         |
| Get Student Course Progress | `courses/get-student-progress.ts` → `getStudentCourseProgress` | `courses/use-student-progress.ts`  | Query    | Cao        | FR12         |

---

## 🎥 **Lessons Management**

| Feature             | Action                                                 | Hook                              | Type     | Priority | Dependencies |
| ------------------- | ------------------------------------------------------ | --------------------------------- | -------- | -------- | ------------ |
| Get Course Lessons  | `lessons/get-course-lessons.ts` → `getCourseLessons`   | `lessons/use-course-lessons.ts`   | Query    | Cao      | FR05         |
| Get Lesson Details  | `lessons/get-lesson.ts` → `getLessonDetails`           | `lessons/use-lesson.ts`           | Query    | Cao      | FR09         |
| Create Lesson       | `lessons/create-lesson.ts` → `createLesson`            | `lessons/use-create-lesson.ts`    | Mutation | Cao      | FR18         |
| Update Lesson       | `lessons/update-lesson.ts` → `updateLesson`            | `lessons/use-update-lesson.ts`    | Mutation | Cao      | FR19         |
| Delete Lesson       | `lessons/delete-lesson.ts` → `deleteLesson`            | `lessons/use-delete-lesson.ts`    | Mutation | Cao      | FR20         |
| Upload Video        | `lessons/upload-video.ts` → `uploadLessonVideo`        | `lessons/use-upload-video.ts`     | Mutation | Cao      | FR18         |
| Reorder Lessons     | `lessons/reorder-lessons.ts` → `reorderLessons`        | `lessons/use-reorder-lessons.ts`  | Mutation | Cao      | FR21         |
| Publish Lesson      | `lessons/publish-lesson.ts` → `publishLesson`          | `lessons/use-publish-lesson.ts`   | Mutation | Cao      | FR18         |
| Unpublish Lesson    | `lessons/unpublish-lesson.ts` → `unpublishLesson`      | `lessons/use-unpublish-lesson.ts` | Mutation | Cao      | FR18         |
| Get Lesson Progress | `lessons/get-lesson-progress.ts` → `getLessonProgress` | `lessons/use-lesson-progress.ts`  | Query    | Cao      | FR10         |

---

## 📝 **Enrollments Management**

| Feature                   | Action                                                           | Hook                                    | Type     | Priority   | Dependencies |
| ------------------------- | ---------------------------------------------------------------- | --------------------------------------- | -------- | ---------- | ------------ |
| Get User Enrollments      | `enrollments/get-user-enrollments.ts` → `getUserEnrollments`     | `enrollments/use-user-enrollments.ts`   | Query    | Cao        | FR08         |
| Create Enrollment         | `enrollments/create-enrollment.ts` → `createEnrollment`          | `enrollments/use-create-enrollment.ts`  | Mutation | Cao        | FR07         |
| Update Enrollment Status  | `enrollments/update-status.ts` → `updateEnrollmentStatus`        | `enrollments/use-update-status.ts`      | Mutation | Cao        | FR08         |
| Drop Enrollment           | `enrollments/drop-enrollment.ts` → `dropEnrollment`              | `enrollments/use-drop-enrollment.ts`    | Mutation | Cao        | FR08         |
| Get Course Enrollments    | `enrollments/get-course-enrollments.ts` → `getCourseEnrollments` | `enrollments/use-course-enrollments.ts` | Query    | Cao        | FR22         |
| Get Enrollment Details    | `enrollments/get-enrollment.ts` → `getEnrollmentDetails`         | `enrollments/use-enrollment.ts`         | Query    | Cao        | FR08         |
| Get Enrollment Statistics | `enrollments/get-enrollment-stats.ts` → `getEnrollmentStats`     | `enrollments/use-enrollment-stats.ts`   | Query    | Trung bình | FR25         |

---

## 📊 **Lesson Progress Management**

| Feature                | Action                                                           | Hook                                      | Type     | Priority   | Dependencies |
| ---------------------- | ---------------------------------------------------------------- | ----------------------------------------- | -------- | ---------- | ------------ |
| Get Lesson Progress    | `lesson-progress/get-progress.ts` → `getLessonProgress`          | `lesson-progress/use-progress.ts`         | Query    | Cao        | FR10         |
| Update Watch Progress  | `lesson-progress/update-progress.ts` → `updateWatchProgress`     | `lesson-progress/use-update-progress.ts`  | Mutation | Cao        | FR10         |
| Mark Lesson Complete   | `lesson-progress/mark-complete.ts` → `markLessonComplete`        | `lesson-progress/use-mark-complete.ts`    | Mutation | Cao        | FR11         |
| Get Course Progress    | `lesson-progress/get-course-progress.ts` → `getCourseProgress`   | `lesson-progress/use-course-progress.ts`  | Query    | Cao        | FR12         |
| Get Student Progress   | `lesson-progress/get-student-progress.ts` → `getStudentProgress` | `lesson-progress/use-student-progress.ts` | Query    | Cao        | FR23         |
| Reset Lesson Progress  | `lesson-progress/reset-progress.ts` → `resetLessonProgress`      | `lesson-progress/use-reset-progress.ts`   | Mutation | Thấp       | FR10         |
| Get Progress Analytics | `lesson-progress/get-analytics.ts` → `getProgressAnalytics`      | `lesson-progress/use-analytics.ts`        | Query    | Trung bình | FR25         |

---

## 👑 **Admin - User Management**

| Feature             | Action                                                     | Hook                                  | Type     | Priority   | Dependencies |
| ------------------- | ---------------------------------------------------------- | ------------------------------------- | -------- | ---------- | ------------ |
| Get All Users       | `admin/users/get-all-users.ts` → `getAllUsers`             | `admin/users/use-all-users.ts`        | Query    | Cao        | FR13         |
| Get User Details    | `admin/users/get-user-details.ts` → `getUserDetails`       | `admin/users/use-user-details.ts`     | Query    | Cao        | FR13         |
| Create User         | `admin/users/create-user.ts` → `createUser`                | `admin/users/use-create-user.ts`      | Mutation | Cao        | FR13         |
| Update User         | `admin/users/update-user.ts` → `updateUser`                | `admin/users/use-update-user.ts`      | Mutation | Cao        | FR13         |
| Update User Role    | `admin/users/update-user-role.ts` → `updateUserRole`       | `admin/users/use-update-user-role.ts` | Mutation | Cao        | FR14         |
| Deactivate User     | `admin/users/deactivate-user.ts` → `deactivateUser`        | `admin/users/use-deactivate-user.ts`  | Mutation | Cao        | FR13         |
| Activate User       | `admin/users/activate-user.ts` → `activateUser`            | `admin/users/use-activate-user.ts`    | Mutation | Cao        | FR13         |
| Delete User         | `admin/users/delete-user.ts` → `deleteUser`                | `admin/users/use-delete-user.ts`      | Mutation | Trung bình | FR13         |
| Get User Statistics | `admin/users/get-user-statistics.ts` → `getUserStatistics` | `admin/users/use-user-statistics.ts`  | Query    | Cao        | FR25         |
| Export Users        | `admin/users/export-users.ts` → `exportUsers`              | `admin/users/use-export-users.ts`     | Mutation | Thấp       | FR25         |
| Get User Activity   | `admin/users/get-user-activity.ts` → `getUserActivity`     | `admin/users/use-user-activity.ts`    | Query    | Trung bình | FR25         |

---

## 👑 **Admin - Course Management**

| Feature               | Action                                                          | Hook                                       | Type     | Priority   | Dependencies |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------ | -------- | ---------- | ------------ |
| Get All Courses       | `admin/courses/get-all-courses.ts` → `getAllCourses`            | `admin/courses/use-all-courses.ts`         | Query    | Cao        | FR15         |
| Get Course Analytics  | `admin/courses/get-course-analytics.ts` → `getCourseAnalytics`  | `admin/courses/use-course-analytics.ts`    | Query    | Cao        | FR25         |
| Bulk Update Courses   | `admin/courses/bulk-update-courses.ts` → `bulkUpdateCourses`    | `admin/courses/use-bulk-update-courses.ts` | Mutation | Trung bình | FR15         |
| Export Courses        | `admin/courses/export-courses.ts` → `exportCourses`             | `admin/courses/use-export-courses.ts`      | Mutation | Thấp       | FR25         |
| Get Course Engagement | `admin/courses/get-engagement.ts` → `getCourseEngagement`       | `admin/courses/use-engagement.ts`          | Query    | Trung bình | FR25         |
| Get Popular Courses   | `admin/courses/get-popular-courses.ts` → `getPopularCourses`    | `admin/courses/use-popular-courses.ts`     | Query    | Trung bình | FR25         |
| Get Course Completion | `admin/courses/get-completion-rates.ts` → `getCourseCompletion` | `admin/courses/use-completion-rates.ts`    | Query    | Cao        | FR25         |

---

## 👑 **Admin - Student Management**

| Feature                 | Action                                                                | Hook                                        | Type     | Priority   | Dependencies |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------- | -------- | ---------- | ------------ |
| Get All Students        | `admin/students/get-all-students.ts` → `getAllStudents`               | `admin/students/use-all-students.ts`        | Query    | Cao        | FR22         |
| Get Student Details     | `admin/students/get-student-details.ts` → `getStudentDetails`         | `admin/students/use-student-details.ts`     | Query    | Cao        | FR22         |
| Get Student Progress    | `admin/students/get-student-progress.ts` → `getStudentProgress`       | `admin/students/use-student-progress.ts`    | Query    | Cao        | FR23         |
| Get Student Enrollments | `admin/students/get-student-enrollments.ts` → `getStudentEnrollments` | `admin/students/use-student-enrollments.ts` | Query    | Cao        | FR22         |
| Get Student Analytics   | `admin/students/get-student-analytics.ts` → `getStudentAnalytics`     | `admin/students/use-student-analytics.ts`   | Query    | Trung bình | FR25         |
| Export Student Data     | `admin/students/export-student-data.ts` → `exportStudentData`         | `admin/students/use-export-student-data.ts` | Mutation | Thấp       | FR25         |
| Get Learning Path       | `admin/students/get-learning-path.ts` → `getStudentLearningPath`      | `admin/students/use-learning-path.ts`       | Query    | Trung bình | FR23         |
| Reset Student Progress  | `admin/students/reset-progress.ts` → `resetStudentProgress`           | `admin/students/use-reset-progress.ts`      | Mutation | Thấp       | FR23         |

---

## 📊 **Dashboard & Analytics**

| Feature              | Action                                                        | Hook                                 | Type  | Priority   | Dependencies |
| -------------------- | ------------------------------------------------------------- | ------------------------------------ | ----- | ---------- | ------------ |
| Student Dashboard    | `dashboard/get-student-stats.ts` → `getStudentDashboardStats` | `dashboard/use-student-stats.ts`     | Query | Cao        | FR08, FR12   |
| Admin Dashboard      | `dashboard/get-admin-stats.ts` → `getAdminDashboardStats`     | `dashboard/use-admin-stats.ts`       | Query | Cao        | FR25         |
| Course Dashboard     | `dashboard/get-course-stats.ts` → `getCourseDashboardStats`   | `dashboard/use-course-stats.ts`      | Query | Cao        | FR15, FR25   |
| Learning Progress    | `dashboard/get-learning-progress.ts` → `getLearningProgress`  | `dashboard/use-learning-progress.ts` | Query | Cao        | FR12         |
| Enrollment Report    | `reports/get-enrollment-report.ts` → `getEnrollmentReport`    | `reports/use-enrollment-report.ts`   | Query | Trung bình | FR25         |
| Course Performance   | `reports/get-course-performance.ts` → `getCoursePerformance`  | `reports/use-course-performance.ts`  | Query | Trung bình | FR25         |
| Student Activity     | `reports/get-student-activity.ts` → `getStudentActivity`      | `reports/use-student-activity.ts`    | Query | Trung bình | FR25         |
| Learning Analytics   | `reports/get-learning-analytics.ts` → `getLearningAnalytics`  | `reports/use-learning-analytics.ts`  | Query | Trung bình | FR25         |
| Completion Trends    | `reports/get-completion-trends.ts` → `getCompletionTrends`    | `reports/use-completion-trends.ts`   | Query | Trung bình | FR25         |
| Popular Categories   | `reports/get-popular-categories.ts` → `getPopularCategories`  | `reports/use-popular-categories.ts`  | Query | Thấp       | FR25         |
| Watch Time Analytics | `reports/get-watch-time.ts` → `getWatchTimeAnalytics`         | `reports/use-watch-time.ts`          | Query | Trung bình | FR25         |

---

## 📁 **File Management**

| Feature            | Action                                             | Hook                            | Type     | Priority   | Dependencies |
| ------------------ | -------------------------------------------------- | ------------------------------- | -------- | ---------- | ------------ |
| Upload Video       | `files/upload-video.ts` → `uploadVideo`            | `files/use-upload-video.ts`     | Mutation | Cao        | FR18         |
| Delete Video       | `files/delete-video.ts` → `deleteVideo`            | `files/use-delete-video.ts`     | Mutation | Cao        | FR20         |
| Upload Thumbnail   | `files/upload-thumbnail.ts` → `uploadThumbnail`    | `files/use-upload-thumbnail.ts` | Mutation | Cao        | FR15         |
| Delete Thumbnail   | `files/delete-thumbnail.ts` → `deleteThumbnail`    | `files/use-delete-thumbnail.ts` | Mutation | Cao        | FR15         |
| Upload Avatar      | `files/upload-avatar.ts` → `uploadAvatar`          | `files/use-upload-avatar.ts`    | Mutation | Cao        | FR03         |
| Get File URL       | `files/get-file-url.ts` → `getFileUrl`             | `files/use-file-url.ts`         | Query    | Cao        | All uploads  |
| Get Video Metadata | `files/get-video-metadata.ts` → `getVideoMetadata` | `files/use-video-metadata.ts`   | Query    | Trung bình | FR18         |
| Process Video      | `files/process-video.ts` → `processVideo`          | `files/use-process-video.ts`    | Mutation | Trung bình | FR18         |

---

## 🗂️ **File Structure**

```
src/
├── actions/
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   └── logout.ts
│   ├── users/
│   │   ├── get-profile.ts
│   │   ├── update-profile.ts
│   │   ├── upload-avatar.ts
│   │   └── change-role.ts
│   ├── categories/
│   │   ├── get-categories.ts
│   │   ├── create-category.ts
│   │   ├── update-category.ts
│   │   └── delete-category.ts
│   ├── courses/
│   │   ├── get-courses.ts
│   │   ├── get-course.ts
│   │   ├── search-courses.ts
│   │   ├── create-course.ts
│   │   ├── update-course.ts
│   │   ├── delete-course.ts
│   │   ├── upload-thumbnail.ts
│   │   ├── publish-course.ts
│   │   ├── unpublish-course.ts
│   │   ├── get-course-statistics.ts
│   │   └── get-student-progress.ts
│   ├── lessons/
│   │   ├── get-course-lessons.ts
│   │   ├── get-lesson.ts
│   │   ├── create-lesson.ts
│   │   ├── update-lesson.ts
│   │   ├── delete-lesson.ts
│   │   ├── upload-video.ts
│   │   ├── reorder-lessons.ts
│   │   ├── publish-lesson.ts
│   │   ├── unpublish-lesson.ts
│   │   └── get-lesson-progress.ts
│   ├── enrollments/
│   │   ├── get-user-enrollments.ts
│   │   ├── create-enrollment.ts
│   │   ├── update-status.ts
│   │   ├── drop-enrollment.ts
│   │   ├── get-course-enrollments.ts
│   │   ├── get-enrollment.ts
│   │   └── get-enrollment-stats.ts
│   ├── lesson-progress/
│   │   ├── get-progress.ts
│   │   ├── update-progress.ts
│   │   ├── mark-complete.ts
│   │   ├── get-course-progress.ts
│   │   ├── get-student-progress.ts
│   │   ├── reset-progress.ts
│   │   └── get-analytics.ts
│   ├── admin/
│   │   ├── users/
│   │   │   ├── get-all-users.ts
│   │   │   ├── get-user-details.ts
│   │   │   ├── create-user.ts
│   │   │   ├── update-user.ts
│   │   │   ├── update-user-role.ts
│   │   │   ├── deactivate-user.ts
│   │   │   ├── activate-user.ts
│   │   │   ├── delete-user.ts
│   │   │   ├── get-user-statistics.ts
│   │   │   ├── export-users.ts
│   │   │   └── get-user-activity.ts
│   │   ├── courses/
│   │   │   ├── get-all-courses.ts
│   │   │   ├── get-course-analytics.ts
│   │   │   ├── bulk-update-courses.ts
│   │   │   ├── export-courses.ts
│   │   │   ├── get-engagement.ts
│   │   │   ├── get-popular-courses.ts
│   │   │   └── get-completion-rates.ts
│   │   └── students/
│   │       ├── get-all-students.ts
│   │       ├── get-student-details.ts
│   │       ├── get-student-progress.ts
│   │       ├── get-student-enrollments.ts
│   │       ├── get-student-analytics.ts
│   │       ├── export-student-data.ts
│   │       ├── get-learning-path.ts
│   │       └── reset-progress.ts
│   ├── dashboard/
│   │   ├── get-student-stats.ts
│   │   ├── get-admin-stats.ts
│   │   ├── get-course-stats.ts
│   │   └── get-learning-progress.ts
│   ├── reports/
│   │   ├── get-enrollment-report.ts
│   │   ├── get-course-performance.ts
│   │   ├── get-student-activity.ts
│   │   ├── get-learning-analytics.ts
│   │   ├── get-completion-trends.ts
│   │   ├── get-popular-categories.ts
│   │   └── get-watch-time.ts
│   ├── files/
│   │   ├── upload-video.ts
│   │   ├── delete-video.ts
│   │   ├── upload-thumbnail.ts
│   │   ├── delete-thumbnail.ts
│   │   ├── upload-avatar.ts
│   │   ├── get-file-url.ts
│   │   ├── get-video-metadata.ts
│   │   └── process-video.ts
│   └── index.ts
├── hooks/
│   ├── auth/
│   │   ├── use-register.ts
│   │   ├── use-login.ts
│   │   └── use-logout.ts
│   ├── users/
│   │   ├── use-profile.ts
│   │   ├── use-update-profile.ts
│   │   ├── use-upload-avatar.ts
│   │   └── use-change-role.ts
│   ├── categories/
│   │   ├── use-categories.ts
│   │   ├── use-create-category.ts
│   │   ├── use-update-category.ts
│   │   └── use-delete-category.ts
│   ├── courses/
│   │   ├── use-courses.ts
│   │   ├── use-course.ts
│   │   ├── use-search-courses.ts
│   │   ├── use-create-course.ts
│   │   ├── use-update-course.ts
│   │   ├── use-delete-course.ts
│   │   ├── use-upload-thumbnail.ts
│   │   ├── use-publish-course.ts
│   │   ├── use-unpublish-course.ts
│   │   ├── use-course-statistics.ts
│   │   └── use-student-progress.ts
│   ├── lessons/
│   │   ├── use-course-lessons.ts
│   │   ├── use-lesson.ts
│   │   ├── use-create-lesson.ts
│   │   ├── use-update-lesson.ts
│   │   ├── use-delete-lesson.ts
│   │   ├── use-upload-video.ts
│   │   ├── use-reorder-lessons.ts
│   │   ├── use-publish-lesson.ts
│   │   ├── use-unpublish-lesson.ts
│   │   └── use-lesson-progress.ts
│   ├── enrollments/
│   │   ├── use-user-enrollments.ts
│   │   ├── use-create-enrollment.ts
│   │   ├── use-update-status.ts
│   │   ├── use-drop-enrollment.ts
│   │   ├── use-course-enrollments.ts
│   │   ├── use-enrollment.ts
│   │   └── use-enrollment-stats.ts
│   ├── lesson-progress/
│   │   ├── use-progress.ts
│   │   ├── use-update-progress.ts
│   │   ├── use-mark-complete.ts
│   │   ├── use-course-progress.ts
│   │   ├── use-student-progress.ts
│   │   ├── use-reset-progress.ts
│   │   └── use-analytics.ts
│   ├── admin/
│   │   ├── users/
│   │   │   ├── use-all-users.ts
│   │   │   ├── use-user-details.ts
│   │   │   ├── use-create-user.ts
│   │   │   ├── use-update-user.ts
│   │   │   ├── use-update-user-role.ts
│   │   │   ├── use-deactivate-user.ts
│   │   │   ├── use-activate-user.ts
│   │   │   ├── use-delete-user.ts
│   │   │   ├── use-user-statistics.ts
│   │   │   ├── use-export-users.ts
│   │   │   └── use-user-activity.ts
│   │   ├── courses/
│   │   │   ├── use-all-courses.ts
│   │   │   ├── use-course-analytics.ts
│   │   │   ├── use-bulk-update-courses.ts
│   │   │   ├── use-export-courses.ts
│   │   │   ├── use-engagement.ts
│   │   │   ├── use-popular-courses.ts
│   │   │   └── use-completion-rates.ts
│   │   └── students/
│   │       ├── use-all-students.ts
│   │       ├── use-student-details.ts
│   │       ├── use-student-progress.ts
│   │       ├── use-student-enrollments.ts
│   │       ├── use-student-analytics.ts
│   │       ├── use-export-student-data.ts
│   │       ├── use-learning-path.ts
│   │       └── use-reset-progress.ts
│   ├── dashboard/
│   │   ├── use-student-stats.ts
│   │   ├── use-admin-stats.ts
│   │   ├── use-course-stats.ts
│   │   └── use-learning-progress.ts
│   ├── reports/
│   │   ├── use-enrollment-report.ts
│   │   ├── use-course-performance.ts
│   │   ├── use-student-activity.ts
│   │   ├── use-learning-analytics.ts
│   │   ├── use-completion-trends.ts
│   │   ├── use-popular-categories.ts
│   │   └── use-watch-time.ts
│   ├── files/
│   │   ├── use-upload-video.ts
│   │   ├── use-delete-video.ts
│   │   ├── use-upload-thumbnail.ts
│   │   ├── use-delete-thumbnail.ts
│   │   ├── use-upload-avatar.ts
│   │   ├── use-file-url.ts
│   │   ├── use-video-metadata.ts
│   │   └── use-process-video.ts
│   └── index.ts
└── lib/
    ├── supabase
    ├── auth.ts
    ├── validations/
    │   ├── auth.ts
    │   ├── course.ts
    │   ├── lesson.ts
    │   ├── enrollment.ts
    │   └── index.ts
    └── utils/
        ├── format.ts
        ├── video.ts
        ├── progress.ts
        └── index.ts
```
