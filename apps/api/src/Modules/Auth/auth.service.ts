// src/Modules/Auth/auth.service.ts
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma, Role, OtpType, User } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import { config } from "@/core/config";
import {
  AuthenticationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/core/errors/AppError";
import { PlunkVerifyService } from "@/services/PlunkVerifyService";
import { PlunkTemplateService } from "@/services/PlunkTemplateService";
import { renderOtpEmail } from "@/templates/emails/otpVerification";
import {
  InitiateRegisterDTO,
  VerifyRegisterOtpDTO,
  LoginDTO,
  ForgotPasswordDTO,
  VerifyResetOtpDTO,
  ResetPasswordDTO,
  ResendOtpDTO,
} from "./AuthDTO";

export interface SanitizedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatar: string | null;
  headline: string | null;
  badge: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  pronouns: string | null;
  customStatus: string | null;
  isEmailVerified: boolean;
  subscribedToNewsletter: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthServices {
  private logger = new AppLogger("AuthServices");

  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Generates a secure random 6-digit numeric string for OTP verification.
   */
  private generateOtpCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Sanitizes User model for frontend/client consumption.
   */
  public sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      headline: user.headline,
      badge: user.badge || (user.role === Role.ADMIN ? "Author" : user.role === Role.MODERATOR ? "Moderator" : "Member"),
      bio: user.bio,
      location: user.location,
      website: user.website,
      githubUrl: user.githubUrl,
      twitterUrl: user.twitterUrl,
      linkedinUrl: user.linkedinUrl,
      pronouns: user.pronouns,
      customStatus: user.customStatus,
      isEmailVerified: user.isEmailVerified,
      subscribedToNewsletter: user.subscribedToNewsletter,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Generates JWT Access Token and persistent database Refresh Token.
   */
  public async generateAuthTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const secret = config.security.jwt.secret || "portfolio-auth-jwt-secret";
    const expiresIn = config.security.jwt.expiresIn || "1d";

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      secret,
      {
        expiresIn: expiresIn as any,
        issuer: config.security.jwt.issuer,
      }
    );

    const refreshTokenString = crypto.randomBytes(40).toString("hex");
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30 days valid

    await this.db.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt: refreshExpiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn,
    };
  }

  /**
   * 1. INITIATE REGISTRATION:
   * Validates user registration data, runs Plunk email hygiene check,
   * generates 6-digit OTP, stores registration draft in OtpVerification,
   * and sends an email with the OTP code.
   */
  public async initiateRegistration(dto: InitiateRegisterDTO) {
    const { email, name, password, role: headline, avatar, subscribedToNewsletter, hp_field } = dto;

    // Honeypot trap
    if (hp_field && hp_field.trim().length > 0) {
      this.logger.warn("⚡ Bot trap triggered during registration attempt", { email });
      return {
        success: true,
        email,
        message: "Verification code sent to your email address.",
      };
    }

    this.logger.info("Initiating registration flow", { email, name });

    // Step 1: Plunk Email Hygiene Verification
    await PlunkVerifyService.verifyEmail(email);

    // Step 2: Check for existing verified user with this email
    const existingUser = await this.db.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isEmailVerified) {
      this.logger.warn("Registration rejected: Email already registered and active", { email });
      throw new ConflictError("An account with this email address already exists. Please sign in.");
    }

    // Step 3: Compute and validate unique username
    let cleanUsername = dto.username;
    if (!cleanUsername) {
      const emailPrefix = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
      cleanUsername = emailPrefix.length >= 3 ? emailPrefix : `user_${crypto.randomInt(1000, 9999)}`;
    }

    const usernameOwner = await this.db.user.findUnique({
      where: { username: cleanUsername },
    });

    if (usernameOwner && usernameOwner.email !== email) {
      // Append random suffix if auto-generated or collision
      cleanUsername = `${cleanUsername}_${crypto.randomInt(100, 999)}`;
    }

    // Step 4: Hash password with bcrypt
    const passwordHash = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // Step 5: Generate 6-digit numeric OTP
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending registration payload
    const draftPayload = JSON.stringify({
      name,
      username: cleanUsername,
      passwordHash,
      headline: headline || "Software Engineer",
      avatar: avatar || null,
      subscribedToNewsletter: subscribedToNewsletter ?? true,
    });

    // Invalidate prior registration OTPs for this email
    await this.db.otpVerification.deleteMany({
      where: {
        email,
        type: OtpType.REGISTER_EMAIL_VERIFY,
      },
    });

    await this.db.otpVerification.create({
      data: {
        email,
        code: otpCode,
        type: OtpType.REGISTER_EMAIL_VERIFY,
        payload: draftPayload,
        expiresAt,
      },
    });

    // Step 6: Dispatch Plunk Email
    const rendered = renderOtpEmail({
      email,
      name,
      code: otpCode,
      purpose: "REGISTER_EMAIL_VERIFY",
      expiresInMinutes: 10,
    });

    try {
      await PlunkTemplateService.sendWithTemplate({
        to: email,
        subject: rendered.subject,
        body: rendered.html,
      });
      this.logger.info("✔ Registration OTP dispatched via email", { email });
    } catch (sendError) {
      this.logger.error("Failed to send registration OTP email", { sendError, email });
    }

    return {
      success: true,
      email,
      message: `Verification code sent to ${email}. Code is valid for 10 minutes.`,
    };
  }

  /**
   * 2. VERIFY REGISTRATION OTP & ACTIVATE ACCOUNT:
   * Validates OTP code, activates user in database, creates session tokens,
   * and optionally subscribes them to the newsletter.
   */
  public async verifyRegisterOtp(
    dto: VerifyRegisterOtpDTO,
    ipAddress?: string,
    userAgent?: string
  ) {
    const { email, otpCode } = dto;
    this.logger.info("Verifying registration OTP", { email });

    const record = await this.db.otpVerification.findFirst({
      where: {
        email,
        type: OtpType.REGISTER_EMAIL_VERIFY,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new BadRequestError("Invalid or expired verification code. Please request a new one.");
    }

    if (record.code !== otpCode) {
      const updatedAttempts = record.attempts + 1;
      await this.db.otpVerification.update({
        where: { id: record.id },
        data: {
          attempts: updatedAttempts,
          used: updatedAttempts >= 5, // Lock after 5 wrong attempts
        },
      });

      if (updatedAttempts >= 5) {
        throw new BadRequestError("Too many incorrect attempts. This verification code has been revoked. Please request a new code.");
      }

      throw new BadRequestError("Incorrect verification code. Please check your email and try again.");
    }

    // Mark OTP as used
    await this.db.otpVerification.update({
      where: { id: record.id },
      data: { used: true },
    });

    if (!record.payload) {
      throw new BadRequestError("Corrupted registration payload. Please start registration again.");
    }

    const payload = JSON.parse(record.payload);

    // Upsert or create user record
    const user = await this.db.user.upsert({
      where: { email },
      update: {
        name: payload.name,
        username: payload.username,
        password: payload.passwordHash,
        headline: payload.headline,
        avatar: payload.avatar,
        subscribedToNewsletter: payload.subscribedToNewsletter,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      },
      create: {
        email,
        name: payload.name,
        username: payload.username,
        password: payload.passwordHash,
        headline: payload.headline,
        avatar: payload.avatar,
        role: Role.USER,
        badge: "Member",
        subscribedToNewsletter: payload.subscribedToNewsletter,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      },
    });

    // Sync to Subscriber model if newsletter is checked
    if (payload.subscribedToNewsletter) {
      try {
        await this.db.subscriber.upsert({
          where: { email },
          update: {
            name: payload.name,
            status: "subscribed",
          },
          create: {
            email,
            name: payload.name,
            status: "subscribed",
            source: "registration_flow",
          },
        });
        this.logger.info("✔ User synced to Subscriber model", { email });
      } catch (subErr) {
        this.logger.warn("Failed to auto-subscribe user to newsletter", { subErr, email });
      }
    }

    // Generate Auth Tokens
    const tokens = await this.generateAuthTokens(user, ipAddress, userAgent);

    this.logger.info("✔ User registration and activation completed", { userId: user.id, email });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      message: "Account verified and activated successfully!",
    };
  }

  /**
   * 3. CREDENTIAL LOGIN:
   * Authenticates user with email & password.
   */
  public async login(dto: LoginDTO, ipAddress?: string, userAgent?: string) {
    const { email, password } = dto;
    this.logger.info("User sign-in attempt", { email });

    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn("Sign-in failed: No user found for email", { email });
      throw new AuthenticationError("Invalid email or password.");
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn("Sign-in failed: Password mismatch", { email });
      throw new AuthenticationError("Invalid email or password.");
    }

    // Update lastLoginAt
    await this.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateAuthTokens(user, ipAddress, userAgent);
    this.logger.info("✔ User signed in successfully", { userId: user.id, email });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      message: `Welcome back, ${user.name}!`,
    };
  }

  /**
   * 4. 1-CLICK DEMO LOGIN:
   * Authenticates instant test accounts for portfolio testing.
   */
  public async demoLogin(userId: string, ipAddress?: string, userAgent?: string) {
    this.logger.info("1-Click Demo Login initiated", { userId });

    let email = "alex@chen.io";
    if (userId === "user-fi" || userId === "fi") {
      email = "fi@amanillah.dev";
    } else if (userId === "user-alex" || userId === "alex") {
      email = "alex@chen.io";
    } else if (userId === "user-sarah" || userId === "sarah") {
      email = "sarah@cloudops.net";
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
    let user = await this.db.user.findFirst({
      where: {
        OR: [
          ...(isUuid ? [{ id: userId }] : []),
          { email },
          { username: userId },
        ],
      },
    });

    if (!user) {
      // Fallback create demo user if not yet seeded
      const demoHash = await Bun.password.hash("password123", { algorithm: "bcrypt", cost: 10 });
      user = await this.db.user.create({
        data: {
          email,
          name: userId === "user-fi" ? "Fi Amanillah" : userId === "user-sarah" ? "Sarah Lin" : "Alex Chen",
          username: userId === "user-fi" ? "fiamanillah" : userId === "user-sarah" ? "sarahlin_sre" : "alexchen_dev",
          password: demoHash,
          role: userId === "user-fi" ? Role.ADMIN : userId === "user-alex" ? Role.MODERATOR : Role.USER,
          headline: userId === "user-fi" ? "Author & Lead Architect" : userId === "user-sarah" ? "Staff SRE & Distributed Systems" : "Senior Frontend Engineer",
          badge: userId === "user-fi" ? "Author" : userId === "user-alex" ? "Core Contributor" : "SRE Lead",
          isEmailVerified: true,
          subscribedToNewsletter: true,
        },
      });
    }

    const tokens = await this.generateAuthTokens(user, ipAddress, userAgent);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
      message: `Signed in as ${user.name} (${user.role})`,
    };
  }

  /**
   * 5. FORGOT PASSWORD:
   * Generates password reset OTP code and dispatches via Plunk email.
   */
  public async forgotPassword(dto: ForgotPasswordDTO) {
    const { email } = dto;
    this.logger.info("Password reset requested", { email });

    const user = await this.db.user.findUnique({
      where: { email },
    });

    // Generic success message to prevent user enumeration attacks
    if (!user) {
      this.logger.warn("Password reset requested for non-existing email", { email });
      return {
        success: true,
        message: "If an account is associated with this email, a verification code has been dispatched.",
      };
    }

    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clean up old reset OTPs
    await this.db.otpVerification.deleteMany({
      where: {
        email,
        type: OtpType.PASSWORD_RESET,
      },
    });

    await this.db.otpVerification.create({
      data: {
        email,
        code: otpCode,
        type: OtpType.PASSWORD_RESET,
        userId: user.id,
        expiresAt,
      },
    });

    const rendered = renderOtpEmail({
      email,
      name: user.name,
      code: otpCode,
      purpose: "PASSWORD_RESET",
      expiresInMinutes: 10,
    });

    try {
      await PlunkTemplateService.sendWithTemplate({
        to: email,
        subject: rendered.subject,
        body: rendered.html,
      });
      this.logger.info("✔ Password reset OTP dispatched via email", { email });
    } catch (err) {
      this.logger.error("Failed to send password reset OTP email", { err, email });
    }

    return {
      success: true,
      message: `A verification code has been dispatched to ${email}.`,
    };
  }

  /**
   * 6. VERIFY PASSWORD RESET OTP:
   */
  public async verifyResetOtp(dto: VerifyResetOtpDTO) {
    const { email, otpCode } = dto;
    this.logger.info("Verifying password reset OTP", { email });

    const record = await this.db.otpVerification.findFirst({
      where: {
        email,
        type: OtpType.PASSWORD_RESET,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.code !== otpCode) {
      throw new BadRequestError("Invalid or expired verification code. Please request a new one.");
    }

    return {
      success: true,
      email,
      message: "Verification code verified successfully. You may now set a new password.",
    };
  }

  /**
   * 7. RESET PASSWORD:
   * Verifies OTP, updates password hash, revokes prior sessions, and issues fresh tokens.
   */
  public async resetPassword(
    dto: ResetPasswordDTO,
    ipAddress?: string,
    userAgent?: string
  ) {
    const { email, otpCode, newPassword } = dto;
    this.logger.info("Executing password reset", { email });

    const record = await this.db.otpVerification.findFirst({
      where: {
        email,
        type: OtpType.PASSWORD_RESET,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.code !== otpCode) {
      throw new BadRequestError("Invalid or expired verification code. Please request a new one.");
    }

    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("Account not found.");
    }

    // Mark OTP as used
    await this.db.otpVerification.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Hash new password
    const newPasswordHash = await Bun.password.hash(newPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // Update password
    await this.db.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        lastLoginAt: new Date(),
      },
    });

    // Revoke old refresh tokens for security
    await this.db.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateAuthTokens(user, ipAddress, userAgent);
    this.logger.info("✔ Password reset successful", { userId: user.id, email });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      message: "Your password has been updated successfully.",
    };
  }

  /**
   * 8. RESEND OTP:
   * Resends registration or password recovery OTP with a 45-second cooldown.
   */
  public async resendOtp(dto: ResendOtpDTO) {
    const { email, type = "REGISTER_EMAIL_VERIFY" } = dto;
    this.logger.info("Resending OTP", { email, type });

    const lastOtp = await this.db.otpVerification.findFirst({
      where: {
        email,
        type: type as OtpType,
      },
      orderBy: { createdAt: "desc" },
    });

    // 45 seconds rate limit cooldown
    if (lastOtp) {
      const timeSinceLast = Date.now() - lastOtp.createdAt.getTime();
      if (timeSinceLast < 45 * 1000) {
        const remaining = Math.ceil((45 * 1000 - timeSinceLast) / 1000);
        throw new BadRequestError(`Please wait ${remaining} seconds before requesting a new code.`);
      }
    }

    const newOtp = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // If registration, preserve draft payload
    const draftPayload = type === "REGISTER_EMAIL_VERIFY" ? lastOtp?.payload : null;

    await this.db.otpVerification.create({
      data: {
        email,
        code: newOtp,
        type: type as OtpType,
        payload: draftPayload,
        expiresAt,
      },
    });

    const rendered = renderOtpEmail({
      email,
      code: newOtp,
      purpose: type as any,
      expiresInMinutes: 10,
    });

    try {
      await PlunkTemplateService.sendWithTemplate({
        to: email,
        subject: rendered.subject,
        body: rendered.html,
      });
      this.logger.info("✔ Resent OTP code via email", { email, type });
    } catch (err) {
      this.logger.error("Failed to resend OTP email", { err, email });
    }

    return {
      success: true,
      message: `A new verification code has been sent to ${email}.`,
    };
  }

  /**
   * 9. REFRESH ACCESS TOKEN:
   */
  public async refreshAccessToken(refreshTokenStr: string) {
    if (!refreshTokenStr) {
      throw new AuthenticationError("Refresh token is required.");
    }

    const record = await this.db.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: true },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new AuthenticationError("Invalid or expired refresh token. Please sign in again.");
    }

    const secret = config.security.jwt.secret || "portfolio-auth-jwt-secret";
    const expiresIn = config.security.jwt.expiresIn || "1d";

    const accessToken = jwt.sign(
      {
        userId: record.user.id,
        email: record.user.email,
        username: record.user.username,
        role: record.user.role,
      },
      secret,
      {
        expiresIn: expiresIn as any,
        issuer: config.security.jwt.issuer,
      }
    );

    return {
      accessToken,
      expiresIn,
      user: this.sanitizeUser(record.user),
    };
  }

  /**
   * 10. LOGOUT:
   * Revokes refresh token.
   */
  public async logout(refreshTokenStr?: string, userId?: string) {
    if (refreshTokenStr) {
      await this.db.refreshToken.updateMany({
        where: { token: refreshTokenStr },
        data: { revokedAt: new Date() },
      });
    } else if (userId) {
      await this.db.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { success: true, message: "Signed out successfully." };
  }

  /**
   * 11. GET CURRENT USER PROFILE (ME):
   */
  public async getMe(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    return this.sanitizeUser(user);
  }
}
