# Constants and Helpers Creation Guidelines

Hướng dẫn tạo constants và helper functions trong LMS.

## Naming Conventions

- **Constants**: `SCREAMING_SNAKE_CASE`
- **Functions**: `camelCase`
- **Types**: `PascalCase`
- **Files**: `kebab-case.ts`

## Error Messages (`src/constants/error-messages.ts`)

### Pattern

```typescript
// <DOMAIN>_ERRORS
export const AUTH_ERRORS = {
  // General → Specific
  UNAUTHORIZED: "Bạn không có quyền truy cập",
  LOGIN_FAILED: "Đăng nhập thất bại",
  EMAIL_ALREADY_EXISTS: "Email đã được sử dụng",
} as const;

// Helper functions
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return GENERIC_ERRORS.SOMETHING_WENT_WRONG;
}

export function isAuthError(error: string): boolean {
  return Object.values(AUTH_ERRORS).includes(error as any);
}
```

### Error Naming: `<ACTION>_<STATUS>`

```typescript
COURSE_CREATE_FAILED: "Tạo khóa học thất bại";
LESSON_NOT_FOUND: "Không tìm thấy bài học";
EMAIL_REQUIRED: "Email là bắt buộc";
```

## Labels (`src/constants/labels.ts`)

### Pattern

```typescript
export const LABELS = {
  // Domain mappings
  USER_ROLES: {
    student: "Học viên",
    admin: "Quản trị viên",
  },

  // UI actions
  UI: {
    create: "Tạo mới",
    edit: "Chỉnh sửa",
    save: "Lưu",
    cancel: "Hủy",
  },

  // Database fields - TABLE_NAME
  COURSE: {
    title: "Tiêu đề khóa học",
    description: "Mô tả khóa học",
  },
} as const;

// Type-safe helpers
export type UserRole = keyof typeof LABELS.USER_ROLES;
export const getUserRoleLabel = (role: UserRole): string => {
  return LABELS.USER_ROLES[role] || role;
};

// Utility functions
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
}
```

## Auth Utilities (`src/lib/auth.ts`)

### Core Pattern

```typescript
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

// Base function
export async function getServerUser(): Promise<AuthUser | null> {
  const supabase = await createServerClient();
  // Get user + profile data
  // Return combined AuthUser or null
}

// Protection: require<Condition>(): Promise<AuthUser>
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.profile.role !== "admin") redirect("/unauthorized");
  return user;
}

// Checks: is<Condition>(): Promise<boolean>
export async function isAdmin(): Promise<boolean> {
  return await hasRole("admin");
}

// Utils: getCurrent<Data>(): Promise<Type | null>
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getServerUser();
  return user?.id || null;
}
```

## Helper Functions

### Validation (`src/lib/utils/validators.ts`)

```typescript
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
```

### Formatting (`src/lib/utils/formatters.ts`)

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
```

## File Organization

```
src/
├── constants/
│   ├── error-messages.ts
│   ├── labels.ts
│   └── index.ts          # Re-exports
├── lib/
│   ├── auth.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── transforms.ts
```

### Index Pattern

```typescript
// src/constants/index.ts
export * from "./error-messages";
export * from "./labels";
export { ERROR_MESSAGES } from "./error-messages";
export { LABELS } from "./labels";
```

## TypeScript Patterns

### Const Assertions

```typescript
export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];
```

### Generic Helpers

```typescript
function isValueInObject<T extends Record<string, string>>(
  obj: T,
  value: string
): value is T[keyof T] {
  return Object.values(obj).includes(value as T[keyof T]);
}

export function isValidCourseStatus(status: string): status is CourseStatus {
  return isValueInObject(COURSE_STATUS, status);
}
```

## Testing

```typescript
// error-messages.test.ts
describe("Error Messages", () => {
  it("should return string error as-is", () => {
    expect(getErrorMessage("Test error")).toBe("Test error");
  });

  it("should identify auth errors", () => {
    expect(isAuthError(AUTH_ERRORS.LOGIN_FAILED)).toBe(true);
    expect(isAuthError("Random error")).toBe(false);
  });
});
```

## Best Practices

1. **Always use `as const`** for immutable objects
2. **Group by domain** (AUTH, COURSE, LESSON, etc.)
3. **Create helper functions** for type checking and formatting
4. **Export both individual and grouped** constants
5. **Write tests** for all helper functions
6. **Use TypeScript types** derived from constants
7. **Keep functions pure** (no side effects)
