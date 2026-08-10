// src/Modules/Subscriber/subscriber.service.ts
import axios from "axios";
import crypto from "crypto";
import { config } from "@/core/config";
import { AppLogger } from "@/core/logging/logger";
import { AppError, BadRequestError, ExternalServiceError, NotFoundError } from "@/core/errors/AppError";
import { prisma } from "@/lib/prisma";
import { renderSubscriptionConfirmationEmail } from "@/templates/emails/subscriptionConfirmation";

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

  // ── Unsubscribe Token Helpers ──────────────────────────────────────────────

  /**
   * Generates a stateless HMAC-SHA256 signed unsubscribe token for a given email.
   * Format: base64url(<email>:<hmac-sha256>)
   */
  public generateUnsubscribeToken(email: string): string {
    const secret = config.security.jwt.secret || "portfolio-unsub-secret";
    const normalizedEmail = email.trim().toLowerCase();
    const hmac = crypto.createHmac("sha256", secret).update(normalizedEmail).digest("hex");
    const payload = `${normalizedEmail}:${hmac}`;
    return Buffer.from(payload).toString("base64url");
  }

  /**
   * Verifies an unsubscribe token and returns the email if valid.
   * Throws BadRequestError if the token is invalid or tampered.
   */
  public verifyUnsubscribeToken(token: string): string {
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const colonIdx = decoded.lastIndexOf(":");
      if (colonIdx === -1) throw new Error("Malformed token");

      const email = decoded.substring(0, colonIdx);
      const providedHmac = decoded.substring(colonIdx + 1);

      const secret = config.security.jwt.secret || "portfolio-unsub-secret";
      const expectedHmac = crypto.createHmac("sha256", secret).update(email).digest("hex");

      // Constant-time comparison to prevent timing attacks
      if (!crypto.timingSafeEqual(Buffer.from(providedHmac, "hex"), Buffer.from(expectedHmac, "hex"))) {
        throw new Error("HMAC mismatch");
      }

      return email;
    } catch {
      throw new BadRequestError("Invalid or expired unsubscribe link.");
    }
  }

  /**
   * Generates the full unsubscribe URL for embedding in emails.
   */
  public buildUnsubscribeUrl(email: string): string {
    const token = this.generateUnsubscribeToken(email);
    return `${config.site.webUrl}/unsubscribe?token=${token}`;
  }

  // ── Stage 2: Honeypot ──────────────────────────────────────────────────────

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

  // ── Stage 3: Turnstile ────────────────────────────────────────────────────

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

  // ── Stage 4: Sanitization & Email Hygiene ─────────────────────────────────

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

  // ── Core CRUD Operations ───────────────────────────────────────────────────

  /**
   * CREATE / SUBSCRIBE: Upsert subscriber in PostgreSQL DB & sync with Plunk
   */
  public async subscribe(payload: { email: string; name?: string; source?: string }): Promise<any> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = this.sanitizeInput(payload.name);
    const cleanSource = this.sanitizeInput(payload.source || "hero_section");

    // Check if subscriber is already subscribed in DB
    const existing = await prisma.subscriber.findUnique({ where: { email: cleanEmail } });
    if (existing && existing.status === "subscribed") {
      this.logger.info(`ℹ️ Subscriber ${cleanEmail} is already subscribed.`);
      // Sync Plunk to guarantee Plunk alignment
      await this.syncSubscriberToPlunk(cleanEmail, cleanName || existing.name || "", true, cleanSource);
      return {
        subscriber: existing,
        alreadySubscribed: true,
        message: "You are already subscribed to the newsletter!",
      };
    }

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

    // 4. Send welcome confirmation email with unsubscribe link
    await this.sendWelcomeEmail(cleanEmail, cleanName);

    return {
      subscriber,
      alreadySubscribed: false,
      message: "Thank you for subscribing! Check your inbox for confirmation.",
    };
  }

  /**
   * UNSUBSCRIBE: Update status to unsubscribed in DB & sync with Plunk
   */
  public async unsubscribe(email: string): Promise<any> {
    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.subscriber.findUnique({ where: { email: cleanEmail } });
    const wasAlreadyUnsubscribed = existing?.status === "unsubscribed";

    const subscriber = await prisma.subscriber.upsert({
      where: { email: cleanEmail },
      update: {
        status: "unsubscribed",
        updatedAt: new Date(),
      },
      create: {
        email: cleanEmail,
        name: null,
        status: "unsubscribed",
        source: "unsubscribe",
      },
    });

    this.logger.info(`✔ Subscriber ${cleanEmail} marked unsubscribed in PostgreSQL DB`);

    // Sync unsubscribe state with Plunk (POST /v1/contacts with subscribed: false)
    await this.syncSubscriberToPlunk(cleanEmail, subscriber.name || "", false);

    return {
      subscriber,
      alreadyUnsubscribed: wasAlreadyUnsubscribed,
      message: wasAlreadyUnsubscribed
        ? "You are already unsubscribed from the newsletter."
        : "You have been successfully unsubscribed.",
    };
  }

  /**
   * UNSUBSCRIBE BY TOKEN: Verify the token, then mark as unsubscribed
   */
  public async unsubscribeByToken(token: string): Promise<{ email: string; alreadyUnsubscribed: boolean; message: string }> {
    const email = this.verifyUnsubscribeToken(token);
    const result = await this.unsubscribe(email);
    this.logger.info(`✔ Subscriber ${email} unsubscribed via signed token link`);
    return {
      email,
      alreadyUnsubscribed: result.alreadyUnsubscribed,
      message: result.message,
    };
  }

  /**
   * CHANGE SUBSCRIPTION EMAIL: Unsubscribes old email in DB & Plunk, and subscribes new email in DB & Plunk.
   */
  public async changeSubscriptionEmail(payload: {
    oldEmail?: string;
    token?: string;
    newEmail: string;
  }): Promise<{ oldEmail: string; newEmail: string }> {
    let cleanOldEmail = payload.oldEmail ? payload.oldEmail.trim().toLowerCase() : "";

    if (payload.token) {
      try {
        cleanOldEmail = this.verifyUnsubscribeToken(payload.token);
      } catch (err) {
        if (!cleanOldEmail) throw err;
      }
    }

    if (!cleanOldEmail) {
      throw new BadRequestError("Previous email address or valid token is required to change subscription email.");
    }

    const cleanNewEmail = payload.newEmail.trim().toLowerCase();
    if (cleanOldEmail === cleanNewEmail) {
      throw new BadRequestError("New email address must be different from current email address.");
    }

    // 1. Unsubscribe old email in PostgreSQL DB & Plunk
    await this.unsubscribe(cleanOldEmail);

    // 2. Subscribe new email in PostgreSQL DB & Plunk (verifies email, upserts in DB, syncs Plunk, sends welcome email)
    await this.subscribe({
      email: cleanNewEmail,
      source: `email_change_from_${cleanOldEmail}`,
    });

    this.logger.info(`✔ Subscription email successfully changed from ${cleanOldEmail} to ${cleanNewEmail}`);
    return { oldEmail: cleanOldEmail, newEmail: cleanNewEmail };
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

  // ── Plunk Sync & Email Dispatch ───────────────────────────────────────────

  /**
   * Helper: Sync subscriber to Plunk contacts API per Plunk Contacts documentation
   * POST /v1/contacts upserts the contact with subscribed: true or subscribed: false
   */
  public async syncSubscriberToPlunk(email: string, name?: string, subscribed: boolean = true, source?: string): Promise<void> {
    const secretKey = config.plunk.secretKey;

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info(`ℹ️ [SIMULATED PLUNK SYNC] Subscriber ${email} set to subscribed=${subscribed}`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await axios.post(
        "https://next-api.useplunk.com/v1/contacts",
        {
          email: cleanEmail,
          subscribed,
          data: {
            name: name || "",
            ...(source ? { source } : {}),
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

      this.logger.info(`✔ Synced subscriber ${cleanEmail} to Plunk (subscribed: ${subscribed})`, { data: response.data });
    } catch (error) {
      const errorDetails = axios.isAxiosError(error) ? error.response?.data : error;
      this.logger.warn(`Failed to sync subscriber ${cleanEmail} to Plunk contacts API`, { error: errorDetails });
    }
  }

  /**
   * Helper: Send Welcome / Subscription Confirmation Email via Plunk /v1/send
   * Includes a signed unsubscribe URL in the email body and List-Unsubscribe header.
   */
  private async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const secretKey = config.plunk.secretKey;
    const recipientEmail = config.contact.recipientEmail;
    const templateId = config.plunk.confirmationTemplateId || config.plunk.templateId;

    // Generate the one-click unsubscribe URL
    const unsubscribeUrl = this.buildUnsubscribeUrl(email);

    const { subject: emailSubject, html: emailBody, listUnsubscribeHeader } = renderSubscriptionConfirmationEmail({
      email,
      name,
      source: "newsletter_subscription",
      unsubscribeUrl,
    });

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info(`ℹ️ [SIMULATED WELCOME EMAIL] Sent welcome email to ${email} | Unsubscribe: ${unsubscribeUrl}`);
      return;
    }

    try {
      const plunkPayload: Record<string, any> = {
        to: email,
        reply: recipientEmail,
        subject: emailSubject,
        body: emailBody,
        data: {
          name: name || "",
          email,
          unsubscribeUrl,
        },
        headers: {
          "List-Unsubscribe": listUnsubscribeHeader,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
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

      this.logger.info(`✔ Welcome email with unsubscribe link delivered to ${email} via Plunk`);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${email}`, { error });
    }
  }
}
