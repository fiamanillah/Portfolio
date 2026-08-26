// src/Modules/Newsletter/NewsletterModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { Role } from "@workspace/db";
import { validateRequest } from "@/middleware/validation";
import { authenticate, requireRole } from "@/middleware/auth";
import { NewsletterService } from "./newsletter.service";
import { NewsletterController } from "./newsletter.controller";
import { NewsletterScheduler } from "./newsletter.scheduler";
import {
  createNewsletterSchema,
  updateNewsletterSchema,
  listNewslettersQuerySchema,
  calculateRecipientsSchema,
  sendTestNewsletterSchema,
  scheduleNewsletterSchema,
  spamCheckSchema,
  listNewsletterLogsQuerySchema,
} from "./NewsletterDTO";

export class NewsletterModule extends BaseModule {
  public name: string = "NewsletterModule";
  public version: string = "1.0.0";
  public basePath: string = "/newsletter/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("NewsletterModule");

  protected async setupUseCases(): Promise<void> {
    const newsletterService = new NewsletterService();
    this.registerService("NewsletterService", newsletterService);
  }

  protected async setupControllers(): Promise<void> {
    const newsletterService =
      this.getService<NewsletterService>("NewsletterService");
    this.registerController(
      "NewsletterController",
      new NewsletterController(newsletterService)
    );
  }

  protected async onAfterInit(): Promise<void> {
    // Start autonomous campaign scheduler (runs every 60 seconds)
    NewsletterScheduler.start(60000);
    this.logger.info("✔ Newsletter module initialized and background scheduler started");
  }

  protected async cleanup(): Promise<void> {
    NewsletterScheduler.stop();
    await super.cleanup();
  }

  protected async setupRoutes(): Promise<void> {
    const controller =
      this.getController<NewsletterController>("NewsletterController");

    // All endpoints are administrative (Role.ADMIN)
    const adminAuth = [authenticate, requireRole(Role.ADMIN)];

    // ── KPI & Analysis Endpoints ─────────────────────────────────────
    // GET /newsletter/v1/stats - Aggregated metrics & deliverability
    this.router.get(
      "/stats",
      ...adminAuth,
      controller.getStats.bind(controller)
    );

    // POST /newsletter/v1/calculate-recipients - Live recipient resolver preview
    this.router.post(
      "/calculate-recipients",
      ...adminAuth,
      validateRequest({ body: calculateRecipientsSchema }),
      controller.calculateRecipients.bind(controller)
    );

    // POST /newsletter/v1/spam-check - Anti-spam deliverability audit
    this.router.post(
      "/spam-check",
      ...adminAuth,
      validateRequest({ body: spamCheckSchema }),
      controller.spamCheck.bind(controller)
    );

    // POST /newsletter/v1/send-test - Multi-email test dispatch
    this.router.post(
      "/send-test",
      ...adminAuth,
      validateRequest({ body: sendTestNewsletterSchema }),
      controller.sendTest.bind(controller)
    );

    // ── Campaign CRUD Endpoints ──────────────────────────────────────
    // GET /newsletter/v1 - List campaigns with filtering & pagination
    this.router.get(
      "/",
      ...adminAuth,
      validateRequest({ query: listNewslettersQuerySchema }),
      controller.list.bind(controller)
    );

    // POST /newsletter/v1 - Create a new campaign (draft or scheduled)
    this.router.post(
      "/",
      ...adminAuth,
      validateRequest({ body: createNewsletterSchema }),
      controller.create.bind(controller)
    );

    // GET /newsletter/v1/:id - Get campaign details with spam report
    this.router.get(
      "/:id",
      ...adminAuth,
      controller.getById.bind(controller)
    );

    // PATCH /newsletter/v1/:id - Update campaign
    this.router.patch(
      "/:id",
      ...adminAuth,
      validateRequest({ body: updateNewsletterSchema }),
      controller.update.bind(controller)
    );

    // DELETE /newsletter/v1/:id - Delete campaign
    this.router.delete(
      "/:id",
      ...adminAuth,
      controller.delete.bind(controller)
    );

    // POST /newsletter/v1/:id/duplicate - Duplicate campaign
    this.router.post(
      "/:id/duplicate",
      ...adminAuth,
      controller.duplicate.bind(controller)
    );

    // ── Dispatch & Scheduling Endpoints ──────────────────────────────
    // POST /newsletter/v1/:id/send - Broadcast immediately
    this.router.post(
      "/:id/send",
      ...adminAuth,
      controller.sendNow.bind(controller)
    );

    // POST /newsletter/v1/:id/schedule - Schedule for future date
    this.router.post(
      "/:id/schedule",
      ...adminAuth,
      validateRequest({ body: scheduleNewsletterSchema }),
      controller.schedule.bind(controller)
    );

    // POST /newsletter/v1/:id/cancel - Cancel scheduled/sending broadcast
    this.router.post(
      "/:id/cancel",
      ...adminAuth,
      controller.cancel.bind(controller)
    );

    // POST /newsletter/v1/:id/sync - Synchronize campaign status & stats with Plunk
    this.router.post(
      "/:id/sync",
      ...adminAuth,
      controller.syncWithPlunk.bind(controller)
    );

    // GET /newsletter/v1/:id/logs - Get recipient delivery logs
    this.router.get(
      "/:id/logs",
      ...adminAuth,
      validateRequest({ query: listNewsletterLogsQuerySchema }),
      controller.getLogs.bind(controller)
    );

    this.logger.info("✔ Newsletter routes registered (/newsletter/v1/*)");
  }
}
