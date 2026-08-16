// packages/shared/src/schemas/auth.schema.ts
import { z } from "zod";

export const otpTypeEnumSchema = z.enum([
  "REGISTER_EMAIL_VERIFY",
  "PASSWORD_RESET",
  "LOGIN_2FA",
]);

export const initiateRegisterSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .transform((val) => val.trim()),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  role: z.string().max(100).optional(),
  avatar: z.string().optional(),
  subscribedToNewsletter: z.boolean().optional().default(true),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});

export const verifyRegisterOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  otpCode: z
    .string()
    .length(6, "Verification code must be exactly 6 digits"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const demoLoginSchema = z.object({
  userId: z.string().min(1, "User identifier is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});

export const verifyResetOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  otpCode: z
    .string()
    .length(6, "Verification code must be exactly 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  otpCode: z
    .string()
    .length(6, "Verification code must be exactly 6 digits"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters"),
});

export const resendOtpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address format")
    .transform((val) => val.trim().toLowerCase()),
  type: otpTypeEnumSchema.optional().default("REGISTER_EMAIL_VERIFY"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
