// src/Modules/Contact/ContactModule.ts
import rateLimit from "express-rate-limit";
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/logging/logger";
import { config } from "@/core/config";
import { validateRequest } from "@/middleware/validation";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { contactSubmissionSchema } from "./ContactDTO";

export class ContactModule extends BaseModule {
  public name: string = "ContactModule";
  public version: string = "1.0.0";
  public basePath: string = "/contact/v1/";
  public dependencies?: string[] | undefined;

  private logger = new AppLogger("ContactModule");

  protected async setupUseCases(): Promise<void> {
    this.registerService("ContactService", new ContactService());
  }

  protected async setupControllers(): Promise<void> {
    const contactService = this.getService<ContactService>("ContactService");
    this.registerController("ContactController", new ContactController(contactService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<ContactController>("ContactController");

    // Rate Limiter: Limit requests per IP (Default: 5 submissions per hour per IP)
    const contactLimiter = rateLimit({
      windowMs: config.contact.rateLimitWindowMs,
      max: config.contact.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Submission limit reached. You have sent 5 emails recently, please try again in an hour.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    });

    // POST /contact/v1/send
    this.router.post(
      "/send",
      contactLimiter,
      validateRequest(contactSubmissionSchema),
      controller.submitContactForm.bind(controller)
    );

    this.logger.info("✔ Contact routes configured: POST /contact/v1/send");
  }
}
