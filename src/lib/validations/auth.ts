import { z } from "zod"
import { VALIDATION_ERRORS } from "@/constants/error-messages"

// Register validation schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_ERRORS.EMAIL_REQUIRED)
    .email(VALIDATION_ERRORS.INVALID_EMAIL_FORMAT),
  password: z
    .string()
    .min(6, VALIDATION_ERRORS.INVALID_PASSWORD_FORMAT),
  fullName: z
    .string()
    .min(2, VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(100, VALIDATION_ERRORS.NAME_TOO_LONG)
    .optional(),
})

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_ERRORS.EMAIL_REQUIRED)
    .email(VALIDATION_ERRORS.INVALID_EMAIL_FORMAT),
  password: z
    .string()
    .min(1, VALIDATION_ERRORS.PASSWORD_REQUIRED),
})

// Update profile validation schema
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(100, VALIDATION_ERRORS.NAME_TOO_LONG)
    .optional(),
  avatar_url: z
    .string()
    .url(VALIDATION_ERRORS.INVALID_URL_FORMAT)
    .optional()
    .nullable(),
})

// Change role validation schema
export const changeRoleSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  role: z.enum(["student", "admin"], {
    errorMap: () => ({ message: "Vai trò không hợp lệ" }),
  }),
})

// Upload avatar validation schema
export const uploadAvatarSchema = z.object({
  file: z.instanceof(FormData, {
    message: VALIDATION_ERRORS.FIELD_REQUIRED,
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema> 