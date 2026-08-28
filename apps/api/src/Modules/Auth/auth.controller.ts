// src/Modules/Auth/auth.controller.ts
import { Request, Response } from "express"
import { BaseController } from "@/core/BaseController"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"
import { AuthServices } from "./auth.service"
import {
  InitiateRegisterDTO,
  VerifyRegisterOtpDTO,
  LoginDTO,
  DemoLoginDTO,
  ForgotPasswordDTO,
  VerifyResetOtpDTO,
  ResetPasswordDTO,
  ResendOtpDTO,
  RefreshTokenDTO,
  GoogleLoginDTO,
} from "./AuthDTO"

export class AuthController extends BaseController {
  protected logger = new AppLogger("AuthController")

  constructor(private readonly authService: AuthServices) {
    super()
  }

  /**
   * Helper to attach HTTP-only refresh token cookie
   */
  private setRefreshTokenCookie(res: Response, refreshToken?: string) {
    if (!refreshToken) return
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: config.server.isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    })
  }

  /**
   * POST /auth/v1/register/initiate
   */
  public async initiateRegistration(req: Request, res: Response) {
    const dto = req.validatedBody as InitiateRegisterDTO
    const result = await this.authService.initiateRegistration(dto)
    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/register/verify-otp
   */
  public async verifyRegisterOtp(req: Request, res: Response) {
    const dto = req.validatedBody as VerifyRegisterOtpDTO
    const ip = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    const result = await this.authService.verifyRegisterOtp(dto, ip, userAgent)
    this.setRefreshTokenCookie(res, result.refreshToken)

    return this.sendCreatedResponse(req, res, result, result.message)
  }

  /**
   * POST /auth/v1/login
   */
  public async login(req: Request, res: Response) {
    const dto = req.validatedBody as LoginDTO
    const ip = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    const result = await this.authService.login(dto, ip, userAgent)
    this.setRefreshTokenCookie(res, result.refreshToken)

    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/demo-login
   */
  public async demoLogin(req: Request, res: Response) {
    const dto = req.validatedBody as DemoLoginDTO
    const ip = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    const result = await this.authService.demoLogin(dto.userId, ip, userAgent)
    this.setRefreshTokenCookie(res, result.refreshToken)

    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/forgot-password
   */
  public async forgotPassword(req: Request, res: Response) {
    const dto = req.validatedBody as ForgotPasswordDTO
    const result = await this.authService.forgotPassword(dto)
    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/verify-reset-otp
   */
  public async verifyResetOtp(req: Request, res: Response) {
    const dto = req.validatedBody as VerifyResetOtpDTO
    const result = await this.authService.verifyResetOtp(dto)
    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/reset-password
   */
  public async resetPassword(req: Request, res: Response) {
    const dto = req.validatedBody as ResetPasswordDTO
    const ip = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    const result = await this.authService.resetPassword(dto, ip, userAgent)
    this.setRefreshTokenCookie(res, result.refreshToken)

    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/resend-otp
   */
  public async resendOtp(req: Request, res: Response) {
    const dto = req.validatedBody as ResendOtpDTO
    const result = await this.authService.resendOtp(dto)
    return this.sendResponse(req, res, result.message, 200, result)
  }

  /**
   * POST /auth/v1/refresh-token
   */
  public async refreshToken(req: Request, res: Response) {
    const dto = (req.validatedBody || {}) as RefreshTokenDTO
    const refreshToken = dto.refreshToken || req.cookies?.refresh_token

    const result = await this.authService.refreshAccessToken(refreshToken)
    return this.sendResponse(
      req,
      res,
      "Token refreshed successfully",
      200,
      result
    )
  }

  /**
   * POST /auth/v1/logout
   */
  public async logout(req: Request, res: Response) {
    const refreshToken = req.body?.refreshToken || req.cookies?.refresh_token
    const userId = req.user?.id

    await this.authService.logout(refreshToken, userId)

    res.clearCookie("refresh_token", { path: "/" })
    res.clearCookie("auth_token", { path: "/" })

    return this.sendResponse(req, res, "Signed out successfully", 200, {
      success: true,
    })
  }

  /**
   * GET /auth/v1/me
   */
  public async getMe(req: Request, res: Response) {
    const userId = req.user!.id
    const user = await this.authService.getMe(userId)
    return this.sendResponse(req, res, "Authenticated user profile", 200, user)
  }

  /**
   * GET /auth/v1/google
   * Initiates Google OAuth consent flow or returns authorization URL.
   */
  public async getGoogleAuthUrl(req: Request, res: Response) {
    const returnTo =
      (req.query.returnTo as string) ||
      (req.query.redirect as string) ||
      config.site.webUrl
    const mode = (req.query.mode as string) || "popup"
    const format = req.query.format as string

    const stateObj = {
      returnTo,
      mode,
      time: Date.now(),
    }
    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url")
    const url = this.authService.getGoogleAuthUrl(state)

    if (format === "json" || req.headers.accept?.includes("application/json")) {
      return this.sendResponse(req, res, "Google OAuth URL generated", 200, {
        url,
      })
    }

    return res.redirect(url)
  }

  /**
   * GET /auth/v1/google/callback
   * Google OAuth2 callback redirect handler.
   */
  public async googleCallback(req: Request, res: Response) {
    const code = req.query.code as string
    const error = req.query.error as string
    const stateStr = req.query.state as string

    let returnTo = config.site.webUrl
    let mode = "popup"

    if (stateStr) {
      try {
        const parsed = JSON.parse(
          Buffer.from(stateStr, "base64url").toString("utf8")
        )
        if (parsed.returnTo) returnTo = parsed.returnTo
        if (parsed.mode) mode = parsed.mode
      } catch {
        // use default returnTo
      }
    }

    const ip = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    // Construct frontend callback URL
    let callbackTarget = returnTo
    if (!callbackTarget.includes("/auth/callback")) {
      callbackTarget = `${callbackTarget.replace(/\/+$/, "")}/auth/callback`
    }
    const separator = callbackTarget.includes("?") ? "&" : "?"

    if (error || !code) {
      this.logger.warn("Google OAuth callback error or user cancellation", {
        error,
      })
      const errorMessage = error || "Google authentication was cancelled."

      return res.redirect(
        `${callbackTarget}${separator}auth_error=${encodeURIComponent(errorMessage)}&mode=${encodeURIComponent(mode)}`
      )
    }

    try {
      const result = await this.authService.authenticateWithGoogle(
        { code, redirectUri: config.google.authCallbackUrl },
        ip,
        userAgent
      )

      this.setRefreshTokenCookie(res, result.refreshToken)
      res.cookie("auth_token", result.accessToken, {
        httpOnly: true,
        secure: config.server.isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      })

      const redirectUrl = `${callbackTarget}${separator}auth_token=${encodeURIComponent(
        result.accessToken
      )}&user=${encodeURIComponent(JSON.stringify(result.user))}&mode=${encodeURIComponent(mode)}`

      return res.redirect(redirectUrl)
    } catch (authErr: unknown) {
      const errMessage =
        authErr instanceof Error
          ? authErr.message
          : "Google authentication failed."
      this.logger.error("Error during Google OAuth code exchange", {
        error: errMessage,
      })

      return res.redirect(
        `${callbackTarget}${separator}auth_error=${encodeURIComponent(errMessage)}&mode=${encodeURIComponent(mode)}`
      )
    }
  }

  /**
   * POST /auth/v1/google
   * Authenticates with Google ID token or code directly (REST API).
   */
  public async googleLogin(req: Request, res: Response) {
    const dto = req.validatedBody as GoogleLoginDTO
    const ip = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    const result = await this.authService.authenticateWithGoogle(
      dto,
      ip,
      userAgent
    )
    this.setRefreshTokenCookie(res, result.refreshToken)

    return this.sendResponse(req, res, result.message, 200, result)
  }
}
