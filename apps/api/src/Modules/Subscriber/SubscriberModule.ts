// src/Modules/Subscriber/SubscriberModule.ts
import rateLimit from "express-rate-limit";
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { config } from "@/core/config";
import { validateRequest } from "@/middleware/validation";
import { SubscriberService } from "./subscriber.service";
import { SubscriberController } from "./subscriber.controller";
import { subscribeSchema, unsubscribeSchema, updateSubscriberSchema, changeEmailSchema } from "./SubscriberDTO";

export class SubscriberModule extends BaseModule {
  public name: string = "SubscriberModule";
  public version: string = "1.0.0";
  public basePath: string = "/subscriber/v1/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("SubscriberModule");

  protected async setupUseCases(): Promise<void> {
    this.registerService("SubscriberService", new SubscriberService());
  }

  protected async setupControllers(): Promise<void> {
    const subscriberService = this.getService<SubscriberService>("SubscriberService");
    this.registerController("SubscriberController", new SubscriberController(subscriberService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<SubscriberController>("SubscriberController");

    // Rate Limiter: Limit subscription requests per IP (Default: 5 requests per hour per IP)
    const subscribeLimiter = rateLimit({
      windowMs: config.contact.rateLimitWindowMs,
      max: config.contact.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Subscription limit reached. You have sent 5 subscription requests recently, please try again in an hour.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    });

    // ── Public Endpoints ─────────────────────────────────────────────
    // POST /subscriber/v1/subscribe
    this.router.post(
      "/subscribe",
      subscribeLimiter,
      validateRequest(subscribeSchema),
      controller.subscribe.bind(controller)
    );

    // POST /subscriber/v1/unsubscribe (by email body)
    this.router.post(
      "/unsubscribe",
      validateRequest(unsubscribeSchema),
      controller.unsubscribe.bind(controller)
    );

    // GET /subscriber/v1/unsubscribe?token= (one-click from email link)
    this.router.get(
      "/unsubscribe",
      controller.unsubscribeByToken.bind(controller)
    );

    // POST /subscriber/v1/change-email
    this.router.post(
      "/change-email",
      validateRequest(changeEmailSchema),
      controller.changeEmail.bind(controller)
    );

    // ── CRUD Admin Endpoints ─────────────────────────────────────────
    // GET /subscriber/v1/list
    this.router.get("/list", controller.getAllSubscribers.bind(controller));

    // GET /subscriber/v1/:id
    this.router.get("/:id", controller.getSubscriberById.bind(controller));

    // PATCH /subscriber/v1/:id
    this.router.patch(
      "/:id",
      validateRequest(updateSubscriberSchema),
      controller.updateSubscriber.bind(controller)
    );

    // DELETE /subscriber/v1/:id
    this.router.delete("/:id", controller.deleteSubscriber.bind(controller));

    this.logger.info("✔ Subscriber routes configured: POST /subscriber/v1/subscribe, GET /subscriber/v1/unsubscribe, CRUD /subscriber/v1/*");
  }
}
