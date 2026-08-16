import multer from "multer"
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { Role } from "@workspace/db"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { StorageService } from "@/services/StorageService"
import { validateRequest } from "@/middleware/validation"
import { authenticate, requireRole } from "@/middleware/auth"
import {
  updateProfileSchema,
  changePasswordSchema,
  updateSubscriptionSchema,
  adminUpdateUserRoleSchema,
  adminUserQuerySchema,
} from "./UserDTO"

export class UserModule extends BaseModule {
  public name: string = "UserModule"
  public version: string = "1.0.0"
  public basePath: string = "/users/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("UserModule")

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma")
    let storageClient
    try {
      storageClient = this.context.getService("storage")
    } catch {
      // Fallback if not registered
    }
    const storage = new StorageService(storageClient)
    this.registerService("UserService", new UserService(prisma, storage))
  }

  protected async setupControllers(): Promise<void> {
    const userService = this.getService<UserService>("UserService")
    this.registerController("UserController", new UserController(userService))
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<UserController>("UserController")

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10485760, // 10MB
      },
    })

    // ── Self Profile & Security Endpoints ─────────────────────────────────────

    // GET /users/v1/profile
    this.router.get(
      "/profile",
      authenticate,
      controller.getProfile.bind(controller)
    )

    // PATCH /users/v1/profile
    this.router.patch(
      "/profile",
      authenticate,
      validateRequest(updateProfileSchema),
      controller.updateProfile.bind(controller)
    )

    // POST /users/v1/profile/avatar - Upload avatar to Cloudflare R2 / S3
    this.router.post(
      "/profile/avatar",
      authenticate,
      upload.single("file"),
      controller.uploadAvatar.bind(controller)
    )

    // DELETE /users/v1/profile/avatar - Delete profile avatar
    this.router.delete(
      "/profile/avatar",
      authenticate,
      controller.deleteAvatar.bind(controller)
    )

    // PATCH /users/v1/change-password
    this.router.patch(
      "/change-password",
      authenticate,
      validateRequest(changePasswordSchema),
      controller.changePassword.bind(controller)
    )

    // PATCH /users/v1/subscription
    this.router.patch(
      "/subscription",
      authenticate,
      validateRequest(updateSubscriptionSchema),
      controller.updateSubscription.bind(controller)
    )

    // DELETE /users/v1/account
    this.router.delete(
      "/account",
      authenticate,
      controller.deleteAccount.bind(controller)
    )

    // ── Administrator RBAC Management Endpoints ──────────────────────────────

    // GET /users/v1/admin/users
    this.router.get(
      "/admin/users",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminUserQuerySchema),
      controller.listUsersAdmin.bind(controller)
    )

    // PATCH /users/v1/admin/users/:id/role
    this.router.patch(
      "/admin/users/:id/role",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminUpdateUserRoleSchema),
      controller.updateUserRoleAdmin.bind(controller)
    )

    // DELETE /users/v1/admin/users/:id
    this.router.delete(
      "/admin/users/:id",
      authenticate,
      requireRole(Role.ADMIN),
      controller.deleteUserAdmin.bind(controller)
    )

    this.logger.info("✔ User & RBAC routes initialized under /users/v1/*")
  }
}
