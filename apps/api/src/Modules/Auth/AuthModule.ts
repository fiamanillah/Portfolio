// src/Modules/Auth/AuthModule.ts
import rateLimit from "express-rate-limit"
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { AuthServices } from "./auth.service"
import { AuthController } from "./auth.controller"
import { validateRequest } from "@/middleware/validation"
import { authenticate } from "@/middleware/auth"
import {
  initiateRegisterSchema,
  verifyRegisterOtpSchema,
  loginSchema,
  demoLoginSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  resendOtpSchema,
  refreshTokenSchema,
  googleLoginSchema,
} from "./AuthDTO"

export class AuthModule extends BaseModule {
  public name: string = "AuthModule"
  public version: string = "1.0.0"
  public basePath: string = "/auth/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("AuthModule")

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma")
    const cache = this.context.getService("cache")
    this.registerService("AuthService", new AuthServices(prisma, cache))
  }

  protected async setupControllers(): Promise<void> {
    const authService = this.getService<AuthServices>("AuthService")
    this.registerController("AuthController", new AuthController(authService))
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<AuthController>("AuthController")

    // ── Rate Limiters ────────────────────────────────────────────────
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many sign-in attempts. Please try again in 15 minutes.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    })

    const registerLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many registration attempts. Please try again in an hour.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    })

    const passwordResetLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message:
          "Too many password reset attempts. Please try again in an hour.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    })

    const otpResendLimiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many OTP requests. Please wait a few minutes.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    })

    // POST /auth/v1/register/initiate
    this.router.post(
      "/register/initiate",
      registerLimiter,
      validateRequest(initiateRegisterSchema),
      controller.initiateRegistration.bind(controller)
    )

    // POST /auth/v1/register/verify-otp
    this.router.post(
      "/register/verify-otp",
      registerLimiter,
      validateRequest(verifyRegisterOtpSchema),
      controller.verifyRegisterOtp.bind(controller)
    )

    // POST /auth/v1/login
    this.router.post(
      "/login",
      loginLimiter,
      validateRequest(loginSchema),
      controller.login.bind(controller)
    )

    // POST /auth/v1/demo-login
    this.router.post(
      "/demo-login",
      validateRequest(demoLoginSchema),
      controller.demoLogin.bind(controller)
    )

    // POST /auth/v1/forgot-password
    this.router.post(
      "/forgot-password",
      passwordResetLimiter,
      validateRequest(forgotPasswordSchema),
      controller.forgotPassword.bind(controller)
    )

    // POST /auth/v1/verify-reset-otp
    this.router.post(
      "/verify-reset-otp",
      passwordResetLimiter,
      validateRequest(verifyResetOtpSchema),
      controller.verifyResetOtp.bind(controller)
    )

    // POST /auth/v1/reset-password
    this.router.post(
      "/reset-password",
      passwordResetLimiter,
      validateRequest(resetPasswordSchema),
      controller.resetPassword.bind(controller)
    )

    // POST /auth/v1/resend-otp
    this.router.post(
      "/resend-otp",
      otpResendLimiter,
      validateRequest(resendOtpSchema),
      controller.resendOtp.bind(controller)
    )

    // POST /auth/v1/refresh-token
    this.router.post(
      "/refresh-token",
      validateRequest(refreshTokenSchema),
      controller.refreshToken.bind(controller)
    )

    // POST /auth/v1/logout
    this.router.post("/logout", controller.logout.bind(controller))

    // GET /auth/v1/me (Authenticated)
    this.router.get("/me", authenticate, controller.getMe.bind(controller))

    // GET /auth/v1/google (Initiate Google OAuth Consent)
    this.router.get("/google", controller.getGoogleAuthUrl.bind(controller))

    // GET /auth/v1/google/callback (Google OAuth Redirect Callback)
    this.router.get(
      "/google/callback",
      controller.googleCallback.bind(controller)
    )

    // POST /auth/v1/google (Direct Google ID Token / Code verification)
    this.router.post(
      "/google",
      loginLimiter,
      validateRequest(googleLoginSchema),
      controller.googleLogin.bind(controller)
    )

    this.logger.info("✔ Auth routes initialized under /auth/v1/*")
  }
}
