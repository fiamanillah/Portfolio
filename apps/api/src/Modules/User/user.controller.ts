// src/Modules/User/user.controller.ts
import { Request, Response } from "express";
import { BaseController } from "@/core/BaseController";
import { AppLogger } from "@workspace/logger";
import { UserService } from "./user.service";
import {
  UpdateProfileDTO,
  ChangePasswordDTO,
  UpdateSubscriptionDTO,
  AdminUpdateUserRoleDTO,
  AdminUserQueryDTO,
} from "./UserDTO";

export class UserController extends BaseController {
  protected logger = new AppLogger("UserController");

  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * GET /users/v1/profile
   */
  public async getProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const profile = await this.userService.getProfile(userId);
    return this.sendResponse(req, res, "Profile retrieved", 200, profile);
  }

  /**
   * PATCH /users/v1/profile
   */
  public async updateProfile(req: Request, res: Response) {
    const userId = req.user!.id;
    const dto = req.validatedBody as UpdateProfileDTO;
    const profile = await this.userService.updateProfile(userId, dto);
    return this.sendResponse(req, res, "Profile updated successfully", 200, profile);
  }

  /**
   * POST /users/v1/profile/avatar
   */
  public async uploadAvatar(req: Request, res: Response) {
    const userId = req.user!.id;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please upload an image file (PNG, JPG, WebP, GIF, SVG).",
      });
    }
    const profile = await this.userService.uploadAvatar(userId, req.file);
    return this.sendResponse(req, res, "Profile avatar updated successfully", 200, profile);
  }

  /**
   * DELETE /users/v1/profile/avatar
   */
  public async deleteAvatar(req: Request, res: Response) {
    const userId = req.user!.id;
    const profile = await this.userService.deleteAvatar(userId);
    return this.sendResponse(req, res, "Profile avatar removed successfully", 200, profile);
  }

  /**
   * PATCH /users/v1/change-password
   */
  public async changePassword(req: Request, res: Response) {
    const userId = req.user!.id;
    const dto = req.validatedBody as ChangePasswordDTO;
    const result = await this.userService.changePassword(userId, dto);

    // Clear session cookies since password changed
    res.clearCookie("refresh_token", { path: "/" });

    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * PATCH /users/v1/subscription
   */
  public async updateSubscription(req: Request, res: Response) {
    const userId = req.user!.id;
    const dto = req.validatedBody as UpdateSubscriptionDTO;
    const result = await this.userService.updateSubscription(userId, dto);
    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * DELETE /users/v1/account
   */
  public async deleteAccount(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await this.userService.deleteAccount(userId);

    res.clearCookie("refresh_token", { path: "/" });
    res.clearCookie("auth_token", { path: "/" });

    return this.sendResponse(req, res, result.message, 200, result);
  }

  /**
   * GET /users/v1/admin/users (Admin only)
   */
  public async listUsersAdmin(req: Request, res: Response) {
    const query = (req.validatedQuery || {}) as AdminUserQueryDTO;
    const { data, pagination, stats } = await this.userService.listUsersAdmin(query);
    return res.status(200).json({
      success: true,
      message: "User list retrieved successfully.",
      data,
      pagination,
      stats,
    });
  }


  /**
   * PATCH /users/v1/admin/users/:id/role (Admin only)
   */
  public async updateUserRoleAdmin(req: Request, res: Response) {
    const currentAdminId = req.user!.id;
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dto = req.validatedBody as AdminUpdateUserRoleDTO;

    const updated = await this.userService.updateUserRoleAdmin(currentAdminId, targetUserId, dto);
    return this.sendResponse(req, res, "User role updated successfully", 200, updated);
  }

  /**
   * DELETE /users/v1/admin/users/:id (Admin only)
   */
  public async deleteUserAdmin(req: Request, res: Response) {
    const currentAdminId = req.user!.id;
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await this.userService.deleteUserAdmin(currentAdminId, targetUserId);
    return this.sendResponse(req, res, result.message, 200, result);
  }
}
