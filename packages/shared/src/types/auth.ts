// packages/shared/src/types/auth.ts
import { z } from "zod";
import { AuthUser, Role } from "./user";
import {
  otpTypeEnumSchema,
  initiateRegisterSchema,
  verifyRegisterOtpSchema,
  loginSchema,
  demoLoginSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  resendOtpSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";

export type OtpType = z.infer<typeof otpTypeEnumSchema>;

export const OTP_TYPES: readonly OtpType[] = [
  "REGISTER_EMAIL_VERIFY",
  "PASSWORD_RESET",
  "LOGIN_2FA",
] as const;

export type InitiateRegisterInput = z.infer<typeof initiateRegisterSchema>;
export type VerifyRegisterOtpInput = z.infer<typeof verifyRegisterOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DemoLoginInput = z.infer<typeof demoLoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: Role;
  username: string;
  iat?: number;
  exp?: number;
  iss?: string;
}

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string | null;
  isEmailVerified: boolean;
}

export type AuthModalStep =
  | "signin"
  | "signup"
  | "register-verify-otp"
  | "forgot-password"
  | "verify-otp"
  | "reset-password";
