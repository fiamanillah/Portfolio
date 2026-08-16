// src/Modules/User/UserModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { Role } from "@workspace/db";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { validateRequest } from "@/middleware/validation";
import { authenticate, requireRole } from "@/middleware/auth";
import {
  updateProfileSchema,
  changePasswordSchema,
  updateSubscriptionSchema,
  adminUpdateUserRoleSchema,
  adminUserQuerySchema,
} from "./UserDTO";

export class UserModule extends BaseModule {
  public name: string = "UserModule";
  public version: string = "1.0.0";
  public basePath: string = "/users/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("UserModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    this.registerService("UserService", new UserService(prisma));
  }

  protected async setupControllers(): Promise<void> {
    const userService = this.getService<UserService>("UserService");
    this.registerController("UserController", new UserController(userService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<UserController>("UserController");

    // ── Self Profile & Security Endpoints ─────────────────────────────────────

    // GET /users/v1/profile
    this.router.get(
      "/profile",
      authenticate,
      controller.getProfile.bind(controller)
    );

    // PATCH /users/v1/profile
    this.router.patch(
      "/profile",
      authenticate,
      validateRequest(updateProfileSchema),
      controller.updateProfile.bind(controller)
    );

    // PATCH /users/v1/change-password
    this.router.patch(
      "/change-password",
      authenticate,
      validateRequest(changePasswordSchema),
      controller.changePassword.bind(controller)
    );

    // PATCH /users/v1/subscription
    this.router.patch(
      "/subscription",
      authenticate,
      validateRequest(updateSubscriptionSchema),
      controller.updateSubscription.bind(controller)
    );

    // DELETE /users/v1/account
    this.router.delete(
      "/account",
      authenticate,
      controller.deleteAccount.bind(controller)
    );

    // ── Administrator RBAC Management Endpoints ──────────────────────────────

    // GET /users/v1/admin/users
    this.router.get(
      "/admin/users",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminUserQuerySchema),
      controller.listUsersAdmin.bind(controller)
    );

    // PATCH /users/v1/admin/users/:id/role
    this.router.patch(
      "/admin/users/:id/role",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminUpdateUserRoleSchema),
      controller.updateUserRoleAdmin.bind(controller)
    );

    // DELETE /users/v1/admin/users/:id
    this.router.delete(
      "/admin/users/:id",
      authenticate,
      requireRole(Role.ADMIN),
      controller.deleteUserAdmin.bind(controller)
    );

    this.logger.info("✔ User & RBAC routes initialized under /users/v1/*");
  }
}
