// src/Modules/Auth/auth.controller.ts
import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@workspace/logger";
import { AuthServices } from "./auth.service";
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
} from "./AuthDTO";

export class AuthController extends BaseController {
  protected logger = new AppLogger("AuthController");

  constructor(private readonly authService: AuthServices) {
    super();
  }

  /**
   * Helper to attach HTTP-only refresh token cookie
   */
  private setRefreshTokenCookie(res: Response, refreshToken?: string) {
    if (!refreshToken) return;
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });
  }

  /**
   * POST /auth/v1/register/initiate
   */
  public async initiateRegistration(req: Request, res: Response) {
    const dto = req.validatedBody as InitiateRegisterDTO;
    const result = await this.authService.initiateRegistration(dto);
    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/register/verify-otp
   */
  public async verifyRegisterOtp(req: Request, res: Response) {
    const dto = req.validatedBody as VerifyRegisterOtpDTO;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.verifyRegisterOtp(dto, ip, userAgent);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return this.sendCreatedResponse(req, res, result, result.message);
  }

  /**
   * POST /auth/v1/login
   */
  public async login(req: Request, res: Response) {
    const dto = req.validatedBody as LoginDTO;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.login(dto, ip, userAgent);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/demo-login
   */
  public async demoLogin(req: Request, res: Response) {
    const dto = req.validatedBody as DemoLoginDTO;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.demoLogin(dto.userId, ip, userAgent);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/forgot-password
   */
  public async forgotPassword(req: Request, res: Response) {
    const dto = req.validatedBody as ForgotPasswordDTO;
    const result = await this.authService.forgotPassword(dto);
    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/verify-reset-otp
   */
  public async verifyResetOtp(req: Request, res: Response) {
    const dto = req.validatedBody as VerifyResetOtpDTO;
    const result = await this.authService.verifyResetOtp(dto);
    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/reset-password
   */
  public async resetPassword(req: Request, res: Response) {
    const dto = req.validatedBody as ResetPasswordDTO;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.resetPassword(dto, ip, userAgent);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/resend-otp
   */
  public async resendOtp(req: Request, res: Response) {
    const dto = req.validatedBody as ResendOtpDTO;
    const result = await this.authService.resendOtp(dto);
    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * POST /auth/v1/refresh-token
   */
  public async refreshToken(req: Request, res: Response) {
    const dto = (req.validatedBody || {}) as RefreshTokenDTO;
    const refreshToken = dto.refreshToken || req.cookies?.refresh_token;

    const result = await this.authService.refreshAccessToken(refreshToken);
    return this.sendResponse(req, res, "Token refreshed successfully", 200, result);
  }

  /**
   * POST /auth/v1/logout
   */
  public async logout(req: Request, res: Response) {
    const refreshToken = req.body?.refreshToken || req.cookies?.refresh_token;
    const userId = req.user?.id;

    await this.authService.logout(refreshToken, userId);

    res.clearCookie("refresh_token", { path: "/" });
    res.clearCookie("auth_token", { path: "/" });

    return this.sendResponse(req, res, "Signed out successfully", 200, { success: true });
  }

  /**
   * GET /auth/v1/me
   */
  public async getMe(req: Request, res: Response) {
    const userId = req.user!.id;
    const user = await this.authService.getMe(userId);
    return this.sendResponse(req, res, "Authenticated user profile", 200, user);
  }
}
