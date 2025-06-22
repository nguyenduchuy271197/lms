import { z } from "zod"

// Get all users validation schema
export const getAllUsersSchema = z.object({
  role: z.enum(['student', 'admin']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1, "Trang phải lớn hơn 0").default(1),
  limit: z.number().int().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa 100").default(10),
})

// Get user by ID validation schema
export const getUserByIdSchema = z.object({
  id: z.string().uuid("ID người dùng không hợp lệ"),
})

// Update user profile validation schema (admin)
export const updateUserProfileSchema = z.object({
  id: z.string().uuid("ID người dùng không hợp lệ"),
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100, "Họ tên quá dài").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  role: z.enum(['student', 'admin']).optional(),
})

// Change user role validation schema
export const changeUserRoleSchema = z.object({
  id: z.string().uuid("ID người dùng không hợp lệ"),
  role: z.enum(['student', 'admin'], {
    required_error: "Vai trò là bắt buộc",
    invalid_type_error: "Vai trò không hợp lệ",
  }),
})

// Delete user validation schema
export const deleteUserSchema = z.object({
  id: z.string().uuid("ID người dùng không hợp lệ"),
})

// Get user statistics validation schema
export const getUserStatisticsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
})

// Get user enrollments validation schema
export const getUserEnrollmentsSchema = z.object({
  id: z.string().uuid("ID người dùng không hợp lệ"),
  status: z.enum(['active', 'completed', 'dropped']).optional(),
})

// Get user activity validation schema
export const getUserActivitySchema = z.object({
  id: z.string().uuid("ID người dùng không hợp lệ"),
  days: z.number().int().min(1, "Số ngày phải lớn hơn 0").max(365, "Số ngày tối đa 365").default(30),
})

// Bulk action validation schema
export const bulkActionSchema = z.object({
  user_ids: z.array(z.string().uuid("ID người dùng không hợp lệ")).min(1, "Phải chọn ít nhất 1 người dùng"),
  action: z.enum(['delete', 'change_role', 'activate', 'deactivate']),
  role: z.enum(['student', 'admin']).optional(),
})

// Export user data validation schema
export const exportUserDataSchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
  role: z.enum(['student', 'admin']).optional(),
  include_enrollments: z.boolean().default(false),
  include_progress: z.boolean().default(false),
})

export type GetAllUsersInput = z.infer<typeof getAllUsersSchema>
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>
export type DeleteUserInput = z.infer<typeof deleteUserSchema>
export type GetUserStatisticsInput = z.infer<typeof getUserStatisticsSchema>
export type GetUserEnrollmentsInput = z.infer<typeof getUserEnrollmentsSchema>
export type GetUserActivityInput = z.infer<typeof getUserActivitySchema>
export type BulkActionInput = z.infer<typeof bulkActionSchema>
export type ExportUserDataInput = z.infer<typeof exportUserDataSchema> 