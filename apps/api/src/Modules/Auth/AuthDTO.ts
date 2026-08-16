// src/Modules/Auth/AuthDTO.ts
import {
  initiateRegisterSchema as sharedInitiateRegisterSchema,
  verifyRegisterOtpSchema as sharedVerifyRegisterOtpSchema,
  loginSchema as sharedLoginSchema,
  demoLoginSchema as sharedDemoLoginSchema,
  forgotPasswordSchema as sharedForgotPasswordSchema,
  verifyResetOtpSchema as sharedVerifyResetOtpSchema,
  resetPasswordSchema as sharedResetPasswordSchema,
  resendOtpSchema as sharedResendOtpSchema,
  refreshTokenSchema as sharedRefreshTokenSchema,
} from "@workspace/shared";

export * from "@workspace/shared";

export const initiateRegisterSchema = {
  body: sharedInitiateRegisterSchema,
};

export const verifyRegisterOtpSchema = {
  body: sharedVerifyRegisterOtpSchema,
};

export const loginSchema = {
  body: sharedLoginSchema,
};

export const demoLoginSchema = {
  body: sharedDemoLoginSchema,
};

export const forgotPasswordSchema = {
  body: sharedForgotPasswordSchema,
};

export const verifyResetOtpSchema = {
  body: sharedVerifyResetOtpSchema,
};

export const resetPasswordSchema = {
  body: sharedResetPasswordSchema,
};

export const resendOtpSchema = {
  body: sharedResendOtpSchema,
};

export const refreshTokenSchema = {
  body: sharedRefreshTokenSchema,
};

export type InitiateRegisterDTO = import("@workspace/shared").InitiateRegisterInput;
export type VerifyRegisterOtpDTO = import("@workspace/shared").VerifyRegisterOtpInput;
export type LoginDTO = import("@workspace/shared").LoginInput;
export type DemoLoginDTO = import("@workspace/shared").DemoLoginInput;
export type ForgotPasswordDTO = import("@workspace/shared").ForgotPasswordInput;
export type VerifyResetOtpDTO = import("@workspace/shared").VerifyResetOtpInput;
export type ResetPasswordDTO = import("@workspace/shared").ResetPasswordInput;
export type ResendOtpDTO = import("@workspace/shared").ResendOtpInput;
export type RefreshTokenDTO = import("@workspace/shared").RefreshTokenInput;
