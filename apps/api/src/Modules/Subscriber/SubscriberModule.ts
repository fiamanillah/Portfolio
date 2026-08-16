// src/Modules/Subscriber/SubscriberModule.ts
import rateLimit from "express-rate-limit"
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { config } from "@/core/config"
import { Role } from "@workspace/db"
import { validateRequest } from "@/middleware/validation"
import { authenticate, requireRole } from "@/middleware/auth"
import { SubscriberService } from "./subscriber.service"
import { SubscriberController } from "./subscriber.controller"
import {
  subscribeSchema,
  unsubscribeSchema,
  updateSubscriberSchema,
  changeEmailSchema,
  adminSubscriberQuerySchema,
  adminCreateSubscriberSchema,
  adminBulkUpdateStatusSchema,
  adminBulkDeleteSchema,
} from "./SubscriberDTO"

export class SubscriberModule extends BaseModule {
  public name: string = "SubscriberModule"
  public version: string = "1.0.0"
  public basePath: string = "/subscriber/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("SubscriberModule")

  protected async setupUseCases(): Promise<void> {
    this.registerService("SubscriberService", new SubscriberService())
  }

  protected async setupControllers(): Promise<void> {
    const subscriberService =
      this.getService<SubscriberService>("SubscriberService")
    this.registerController(
      "SubscriberController",
      new SubscriberController(subscriberService)
    )
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<SubscriberController>(
      "SubscriberController"
    )

    // Rate Limiter: Limit subscription requests per IP (Default: 5 requests per hour per IP)
    const subscribeLimiter = rateLimit({
      windowMs: config.contact.rateLimitWindowMs,
      max: config.contact.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message:
          "Subscription limit reached. You have sent 5 subscription requests recently, please try again in an hour.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    })

    // ── Public Endpoints ─────────────────────────────────────────────
    // POST /subscriber/v1/subscribe
    this.router.post(
      "/subscribe",
      subscribeLimiter,
      validateRequest(subscribeSchema),
      controller.subscribe.bind(controller)
    )

    // POST /subscriber/v1/unsubscribe (by email body)
    this.router.post(
      "/unsubscribe",
      validateRequest(unsubscribeSchema),
      controller.unsubscribe.bind(controller)
    )

    // GET /subscriber/v1/unsubscribe?token= (one-click from email link)
    this.router.get(
      "/unsubscribe",
      controller.unsubscribeByToken.bind(controller)
    )

    // POST /subscriber/v1/change-email
    this.router.post(
      "/change-email",
      validateRequest(changeEmailSchema),
      controller.changeEmail.bind(controller)
    )

    // ── Administrator Audience Management Endpoints (RBAC: ADMIN) ────

    // GET /subscriber/v1/list
    this.router.get(
      "/list",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminSubscriberQuerySchema),
      controller.getAllSubscribers.bind(controller)
    )

    // GET /subscriber/v1/admin/stats
    this.router.get(
      "/admin/stats",
      authenticate,
      requireRole(Role.ADMIN),
      controller.getStats.bind(controller)
    )

    // POST /subscriber/v1/admin/create
    this.router.post(
      "/admin/create",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminCreateSubscriberSchema),
      controller.adminCreateSubscriber.bind(controller)
    )

    // POST /subscriber/v1/admin/bulk-status
    this.router.post(
      "/admin/bulk-status",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminBulkUpdateStatusSchema),
      controller.bulkUpdateStatus.bind(controller)
    )

    // POST /subscriber/v1/admin/bulk-delete
    this.router.post(
      "/admin/bulk-delete",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminBulkDeleteSchema),
      controller.bulkDelete.bind(controller)
    )

    // POST /subscriber/v1/admin/:id/resend
    this.router.post(
      "/admin/:id/resend",
      authenticate,
      requireRole(Role.ADMIN),
      controller.resendWelcomeEmail.bind(controller)
    )

    // GET /subscriber/v1/admin/export
    this.router.get(
      "/admin/export",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(adminSubscriberQuerySchema),
      controller.exportSubscribers.bind(controller)
    )

    // GET /subscriber/v1/:id
    this.router.get(
      "/:id",
      authenticate,
      requireRole(Role.ADMIN),
      controller.getSubscriberById.bind(controller)
    )

    // PATCH /subscriber/v1/:id
    this.router.patch(
      "/:id",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(updateSubscriberSchema),
      controller.updateSubscriber.bind(controller)
    )

    // DELETE /subscriber/v1/:id
    this.router.delete(
      "/:id",
      authenticate,
      requireRole(Role.ADMIN),
      controller.deleteSubscriber.bind(controller)
    )

    this.logger.info(
      "✔ Subscriber module routes registered with RBAC guards & full management capabilities"
    )
  }
}
