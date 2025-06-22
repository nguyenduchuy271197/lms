import { Database } from "./database.types";

export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];


// Core Job Board Types
export type Course = Row<"courses">;
export type CourseInsertDto = InsertDto<"courses">;
export type CourseUpdateDto = UpdateDto<"courses">;
export type CourseWithLessons = Course & {
  lessons: Lesson[];
};

export type CourseWithCategory = Course & {
  category: Category;
};

    
export type Lesson = Row<"lessons">;
export type LessonInsertDto = InsertDto<"lessons">;
export type LessonUpdateDto = UpdateDto<"lessons">;
export type LessonWithCourse = Lesson & {
  course: Course;
};


export type Enrollment = Row<"enrollments">;
export type EnrollmentInsertDto = InsertDto<"enrollments">;
export type EnrollmentUpdateDto = UpdateDto<"enrollments">;
export type EnrollmentWithCourse = Enrollment & {
  course: Course;
};

export type EnrollmentWithDetails = Enrollment & {
  courses?: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    slug: string;
    is_published: boolean;
    categories?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  profiles?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
  };
};

export type LessonProgress = Row<"lesson_progress">;
export type LessonProgressInsertDto = InsertDto<"lesson_progress">;
export type LessonProgressUpdateDto = UpdateDto<"lesson_progress">;
export type LessonProgressWithEnrollment = LessonProgress & {
  enrollment: Enrollment;
};

export type Category = Row<"categories">;
export type CategoryInsertDto = InsertDto<"categories">;
export type CategoryUpdateDto = UpdateDto<"categories">;
export type CategoryWithCourses = Category & {
  courses: Course[];
};

export type Profile = Row<"profiles">;
export type ProfileInsertDto = InsertDto<"profiles">;
export type ProfileUpdateDto = UpdateDto<"profiles">;
export type ProfileWithEnrollments = Profile & {
  enrollments: Enrollment[];
};

export type UserRole = Database["public"]["Enums"]["user_role"];
export type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];
export type LessonType = Database["public"]["Enums"]["lesson_type"];