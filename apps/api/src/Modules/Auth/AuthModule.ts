// src/Modules/Auth/AuthModule.ts
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
} from "./AuthDTO"

export class AuthModule extends BaseModule {
  public name: string = "AuthModule"
  public version: string = "1.0.0"
  public basePath: string = "/auth/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("AuthModule")

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma")
    this.registerService("AuthService", new AuthServices(prisma))
  }

  protected async setupControllers(): Promise<void> {
    const authService = this.getService<AuthServices>("AuthService")
    this.registerController("AuthController", new AuthController(authService))
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<AuthController>("AuthController")

    // POST /auth/v1/register/initiate
    this.router.post(
      "/register/initiate",
      validateRequest(initiateRegisterSchema),
      controller.initiateRegistration.bind(controller)
    )

    // POST /auth/v1/register/verify-otp
    this.router.post(
      "/register/verify-otp",
      validateRequest(verifyRegisterOtpSchema),
      controller.verifyRegisterOtp.bind(controller)
    )

    // POST /auth/v1/login
    this.router.post(
      "/login",
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
      validateRequest(forgotPasswordSchema),
      controller.forgotPassword.bind(controller)
    )

    // POST /auth/v1/verify-reset-otp
    this.router.post(
      "/verify-reset-otp",
      validateRequest(verifyResetOtpSchema),
      controller.verifyResetOtp.bind(controller)
    )

    // POST /auth/v1/reset-password
    this.router.post(
      "/reset-password",
      validateRequest(resetPasswordSchema),
      controller.resetPassword.bind(controller)
    )

    // POST /auth/v1/resend-otp
    this.router.post(
      "/resend-otp",
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

    this.logger.info("✔ Auth routes initialized under /auth/v1/*")
  }
}
