// src/Modules/Subscriber/subscriber.service.ts
import axios from "axios";
import { config } from "@/core/config";
import { AppLogger } from "@/core/logging/logger";
import { AppError, BadRequestError, ExternalServiceError, NotFoundError } from "@/core/errors/AppError";
import { prisma } from "@/lib/prisma";

export interface SubscriberPayload {
  email: string;
  name?: string;
  source?: string;
  captchaToken?: string;
  hp_field?: string;
}

export class SubscriberService {
  private logger = new AppLogger("SubscriberService");

  /**
   * Helper to check if an API secret key is missing or is a placeholder/example key
   */
  private isPlaceholderKey(key?: string): boolean {
    if (!key) return true;
    const trimmed = key.trim().toLowerCase();
    return (
      trimmed === "" ||
      trimmed.includes("your_key") ||
      trimmed.includes("your_secret") ||
      trimmed.includes("yourturnstile") ||
      trimmed.includes("placeholder") ||
      trimmed.includes("change-me") ||
      trimmed.startsWith("plunk_sk_your") ||
      trimmed.startsWith("0x4aaaaaaa") ||
      trimmed.startsWith("1x0000000") ||
      trimmed.startsWith("2x0000000") ||
      trimmed.startsWith("3x0000000")
    );
  }

  /**
   * Stage 2 Check: Honeypot trap evaluation
   */
  public isHoneypotTriggered(hp_field?: string): boolean {
    if (hp_field && hp_field.trim().length > 0) {
      this.logger.warn("⚡ Honeypot trap triggered on subscriber form by bot");
      return true;
    }
    return false;
  }

  /**
   * Stage 3: Cloudflare Turnstile CAPTCHA token verification
   */
  public async verifyTurnstileToken(token?: string, clientIp?: string): Promise<boolean> {
    const secretKey = config.turnstile.secretKey;

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.warn("⚠️ TURNSTILE_SECRET_KEY missing or placeholder/test key. Bypassing Turnstile verification in dev/demo mode.");
      return true;
    }

    if (!token) {
      this.logger.info("ℹ️ No Turnstile CAPTCHA token provided in subscriber payload. Relying on Honeypot & Rate Limiter defenses.");
      return true;
    }

    try {
      const response = await axios.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        new URLSearchParams({
          secret: secretKey,
          response: token,
          ...(clientIp ? { remoteip: clientIp } : {}),
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 5000,
        }
      );

      const data = response.data;
      if (!data.success) {
        this.logger.warn("Cloudflare Turnstile token verification failed", { errorCodes: data["error-codes"] });
        return false;
      }

      this.logger.info("✔ Cloudflare Turnstile verification successful for subscriber");
      return true;
    } catch (error) {
      this.logger.error("Error connecting to Cloudflare Turnstile API", { error });
      return true;
    }
  }

  /**
   * Stage 4a: Data Hygiene & Input Sanitization
   */
  public sanitizeInput(text?: string): string {
    if (!text) return "";
    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();
  }

  /**
   * Stage 4b: Plunk Email Hygiene & Disposable check (/v1/verify)
   */
  public async verifyEmailWithPlunk(email: string): Promise<void> {
    const secretKey = config.plunk.secretKey;

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.warn("⚠️ PLUNK_SECRET_KEY missing or placeholder. Skipping Plunk /v1/verify in dev/demo mode.");
      return;
    }

    try {
      const response = await axios.get(`https://next-api.useplunk.com/v1/verify?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        timeout: 5000,
      });

      const data = response.data;
      if (data && (data.disposable || data.is_disposable || data.valid === false)) {
        this.logger.warn(`Rejected subscription from disposable/invalid email: ${email}`);
        throw new BadRequestError("Disposable or invalid email addresses are not allowed. Please provide a primary email address.");
      }

      this.logger.info(`✔ Plunk email verification passed for subscriber ${email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (axios.isAxiosError(error) && error.response) {
        const resData = error.response.data;
        if (resData?.message?.includes("disposable") || error.response.status === 400) {
          throw new BadRequestError("The email provided appears to be temporary or improperly formatted. Please use a valid email.");
        }
      }

      this.logger.warn("Plunk verify check encountered issue, allowing subscription to proceed if properly formatted", { error });
    }
  }

  /**
   * CREATE / SUBSCRIBE: Upsert subscriber in PostgreSQL DB & sync with Plunk
   */
  public async subscribe(payload: { email: string; name?: string; source?: string }): Promise<any> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = this.sanitizeInput(payload.name);
    const cleanSource = this.sanitizeInput(payload.source || "hero_section");

    // 1. Verify email validity
    await this.verifyEmailWithPlunk(cleanEmail);

    // 2. Persist subscriber in PostgreSQL database
    const subscriber = await prisma.subscriber.upsert({
      where: { email: cleanEmail },
      update: {
        name: cleanName || undefined,
        status: "subscribed",
        source: cleanSource,
        updatedAt: new Date(),
      },
      create: {
        email: cleanEmail,
        name: cleanName || null,
        status: "subscribed",
        source: cleanSource,
      },
    });

    this.logger.info(`✔ Subscriber record persisted in DB for ${cleanEmail}`);

    // 3. Sync subscriber to Plunk subscriber list (/v1/contacts API)
    await this.syncSubscriberToPlunk(cleanEmail, cleanName, true, cleanSource);

    // 4. Send welcome confirmation email
    await this.sendWelcomeEmail(cleanEmail, cleanName);

    return subscriber;
  }

  /**
   * UNSUBSCRIBE: Update status to unsubscribed in DB & sync with Plunk
   */
  public async unsubscribe(email: string): Promise<any> {
    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.subscriber.findUnique({ where: { email: cleanEmail } });
    if (!existing) {
      throw new NotFoundError(`Subscriber with email ${cleanEmail} not found`);
    }

    const subscriber = await prisma.subscriber.update({
      where: { email: cleanEmail },
      data: {
        status: "unsubscribed",
        updatedAt: new Date(),
      },
    });

    this.logger.info(`✔ Subscriber ${cleanEmail} marked unsubscribed in DB`);

    // Sync unsubscribe state with Plunk
    await this.syncSubscriberToPlunk(cleanEmail, existing.name || "", false);

    return subscriber;
  }

  /**
   * READ ALL: Get paginated list of subscribers
   */
  public async getAllSubscribers(page: number = 1, limit: number = 20): Promise<{ data: any[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.findMany({
        skip,
        take: limit,
        orderBy: { subscribedAt: "desc" },
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * READ ONE: Get single subscriber by ID
   */
  public async getSubscriberById(id: string): Promise<any> {
    const subscriber = await prisma.subscriber.findUnique({ where: { id } });
    if (!subscriber) {
      throw new NotFoundError(`Subscriber with ID ${id} not found`);
    }
    return subscriber;
  }

  /**
   * UPDATE: Update subscriber profile & sync with Plunk
   */
  public async updateSubscriber(id: string, data: { name?: string; status?: string }): Promise<any> {
    const existing = await this.getSubscriberById(id);

    const updated = await prisma.subscriber.update({
      where: { id },
      data: {
        name: data.name !== undefined ? this.sanitizeInput(data.name) : existing.name,
        status: data.status !== undefined ? data.status : existing.status,
        updatedAt: new Date(),
      },
    });

    this.logger.info(`✔ Subscriber ${existing.email} updated in DB`);

    // Sync updated state to Plunk
    await this.syncSubscriberToPlunk(
      updated.email,
      updated.name || "",
      updated.status === "subscribed",
      updated.source
    );

    return updated;
  }

  /**
   * DELETE: Delete subscriber from DB & sync deletion/unsubscribe to Plunk
   */
  public async deleteSubscriber(id: string): Promise<void> {
    const existing = await this.getSubscriberById(id);

    await prisma.subscriber.delete({ where: { id } });
    this.logger.info(`✔ Subscriber ${existing.email} deleted from DB`);

    // Sync unsubscribe/delete to Plunk
    await this.syncSubscriberToPlunk(existing.email, existing.name || "", false);
  }

  /**
   * Helper: Sync subscriber to Plunk POST /v1/contacts API
   */
  public async syncSubscriberToPlunk(email: string, name?: string, subscribed: boolean = true, source?: string): Promise<void> {
    const secretKey = config.plunk.secretKey;

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info(`ℹ️ [SIMULATED PLUNK SYNC] Subscriber ${email} set to subscribed=${subscribed}`);
      return;
    }

    try {
      await axios.post(
        "https://next-api.useplunk.com/v1/contacts",
        {
          email,
          subscribed,
          data: {
            name: name || "",
            source: source || "hero_section",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      this.logger.info(`✔ Synced subscriber ${email} to Plunk (subscribed: ${subscribed})`);
    } catch (error) {
      this.logger.warn(`Failed to sync subscriber ${email} to Plunk contacts API`, { error });
    }
  }

  /**
   * Helper: Send Welcome / Subscription Confirmation Email via Plunk /v1/send
   */
  private async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const secretKey = config.plunk.secretKey;
    const recipientEmail = config.contact.recipientEmail;
    const templateId = config.plunk.confirmationTemplateId || config.plunk.templateId;

    const emailSubject = `[Newsletter] Welcome to Fi Amanillah's Updates!`;
    const displayName = name || "there";
    const emailBody = `
<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">Welcome to My Newsletter!</h2>
    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">You're now subscribed to project updates & tech insights</p>
  </div>
  
  <p style="font-size: 15px; line-height: 1.6; color: #374151;">Hi <strong>${displayName}</strong>,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
    Thank you for subscribing! You will receive periodic updates regarding my latest full-stack projects, architecture articles, and DevOps automated solutions.
  </p>

  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
    Best regards,<br/>
    <strong>Fi Amanillah</strong>
  </div>
</div>
    `.trim();

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info(`ℹ️ [SIMULATED WELCOME EMAIL] Sent welcome email to ${email}`);
      return;
    }

    try {
      const plunkPayload: Record<string, any> = {
        to: email,
        reply: recipientEmail,
        subject: emailSubject,
        body: emailBody,
        subscribed: true,
        data: {
          name: name || "",
          email,
        },
      };

      if (templateId) {
        plunkPayload.template = templateId;
      }

      await axios.post("https://next-api.useplunk.com/v1/send", plunkPayload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      this.logger.info(`✔ Welcome email delivered to ${email} via Plunk`);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${email}`, { error });
    }
  }
}
