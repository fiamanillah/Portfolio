// src/Modules/Contact/contact.service.ts
import axios from "axios";
import { config } from "@/core/config";
import { AppLogger } from "@/core/logging/logger";
import { AppError, BadRequestError, ExternalServiceError } from "@/core/errors/AppError";
import { prisma } from "@/lib/prisma";
import { renderContactNotificationEmail } from "@/templates/emails/contactNotification";
import { renderContactConfirmationEmail } from "@/templates/emails/contactConfirmation";

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  subscribe?: boolean;
  captchaToken?: string;
  hp_field?: string;
}

export class ContactService {
  private logger = new AppLogger("ContactService");

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
      this.logger.warn("⚡ Honeypot trap triggered by automated submission bot");
      return true;
    }
    return false;
  }

  /**
   * Stage 3: Cloudflare Turnstile token verification
   */
  public async verifyTurnstileToken(token?: string, clientIp?: string): Promise<boolean> {
    const secretKey = config.turnstile.secretKey;

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.warn("⚠️ TURNSTILE_SECRET_KEY missing or placeholder. Bypassing Turnstile verification in dev/demo mode.");
      return true;
    }

    if (!token) {
      this.logger.warn("CAPTCHA token missing from submission payload");
      return false;
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

      this.logger.info("✔ Cloudflare Turnstile verification successful");
      return true;
    } catch (error) {
      this.logger.error("Error connecting to Cloudflare Turnstile API", { error });
      throw new ExternalServiceError("Failed to verify security token with Cloudflare");
    }
  }

  /**
   * Stage 4a: Data Hygiene & Input Sanitization (XSS Prevention)
   */
  public sanitizeInput(text: string): string {
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
   * Stage 4b: Plunk Email Verification (Disposable check & syntax check)
   */
  public async verifyEmailWithPlunk(email: string): Promise<void> {
    const secretKey = config.plunk.secretKey;

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.warn("⚠️ PLUNK_SECRET_KEY missing or placeholder. Skipping Plunk /v1/verify in dev/demo mode.");
      return;
    }

    try {
      const response = await axios.get(`${config.plunk.apiUrl}/verify?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        timeout: 5000,
      });

      const data = response.data;
      if (data && (data.disposable || data.is_disposable || data.valid === false)) {
        this.logger.warn(`Rejected contact form submission from disposable/invalid email: ${email}`);
        throw new BadRequestError("Disposable or invalid email addresses are not allowed. Please provide a primary email address.");
      }

      this.logger.info(`✔ Plunk email verification passed for ${email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;

      // If Plunk returns 400 or disposable error
      if (axios.isAxiosError(error) && error.response) {
        const resData = error.response.data;
        if (resData?.message?.includes("disposable") || error.response.status === 400) {
          throw new BadRequestError("The email provided appears to be temporary or improperly formatted. Please use a valid email.");
        }
      }

      this.logger.warn("Plunk verify check encountered issue, allowing submission to proceed if properly formatted", { error });
    }
  }

  /**
   * Save contact submission and optional subscriber to PostgreSQL DB
   * and sync subscriber to Plunk subscriber list via POST /v1/contacts API
   */
  public async saveSubmissionAndSubscription(payload: {
    name: string;
    email: string;
    subject?: string;
    message: string;
    subscribe?: boolean;
    ipAddress?: string;
  }): Promise<void> {
    try {
      // 1. Save contact submission record in PostgreSQL database
      await prisma.contactSubmission.create({
        data: {
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          subscribed: payload.subscribe ?? false,
          ipAddress: payload.ipAddress,
        },
      });
      this.logger.info(`✔ Saved contact submission record in DB for ${payload.email}`);

      // 2. If subscribe checkbox is selected, persist Subscriber in DB & sync with Plunk
      if (payload.subscribe) {
        await prisma.subscriber.upsert({
          where: { email: payload.email },
          update: {
            name: payload.name,
            status: "subscribed",
            updatedAt: new Date(),
          },
          create: {
            email: payload.email,
            name: payload.name,
            status: "subscribed",
            source: "contact_form",
          },
        });
        this.logger.info(`✔ Saved subscriber in DB for ${payload.email}`);

        // Sync with Plunk contact list (/v1/contacts)
        await this.addSubscriberToPlunk(payload.email, payload.name);
      }
    } catch (dbError) {
      this.logger.error("Error persisting contact submission/subscriber in database", { error: dbError });
      // Non-blocking fallback: do not crash request if DB write fails
    }
  }

  /**
   * Sync subscriber to Plunk contact subscriber list via POST /v1/contacts API
   */
  public async addSubscriberToPlunk(email: string, name?: string): Promise<void> {
    const secretKey = config.plunk.secretKey;
    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info(`ℹ️ [SIMULATED PLUNK SUBSCRIBER SYNC] Added ${email} to Plunk subscriber list`);
      return;
    }

    try {
      await axios.post(
        `${config.plunk.apiUrl}/contacts`,
        {
          email,
          subscribed: true,
          data: {
            name: name || "",
            source: "contact_form",
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
      this.logger.info(`✔ Added/updated subscriber ${email} in Plunk subscriber list`);
    } catch (error) {
      this.logger.warn(`Failed to sync subscriber ${email} to Plunk contacts API`, { error });
    }
  }

  /**
   * Stage 5a: Delivery of Admin Notification via Plunk /v1/send with Plunk Template support
   */
  public async sendContactEmail(payload: { name: string; email: string; subject: string; message: string; subscribe?: boolean }): Promise<void> {
    const secretKey = config.plunk.secretKey;
    const recipientEmail = config.contact.recipientEmail;
    const templateId = config.plunk.templateId;

    const { subject: emailSubject, html: emailBody } = renderContactNotificationEmail({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      subscribed: payload.subscribe,
    });

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info("ℹ️ [SIMULATED EMAIL DELIVERY] Missing or placeholder PLUNK_SECRET_KEY detected in .env.");
      this.logger.info(`To: ${recipientEmail}`);
      this.logger.info(`Template ID: ${templateId}`);
      this.logger.info(`Subject: ${emailSubject}`);
      this.logger.info(`Body:\n${payload.message}`);
      return;
    }

    try {
      const plunkPayload: Record<string, any> = {
        to: recipientEmail,
        reply: payload.email,
        subject: emailSubject,
        body: emailBody,
        data: {
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          subscribed: payload.subscribe ?? false,
        },
      };

      if (templateId) {
        plunkPayload.template = templateId;
      }

      await axios.post(`${config.plunk.apiUrl}/send`, plunkPayload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      this.logger.info(`✔ Contact notification email successfully delivered to ${recipientEmail} via Plunk (Template: ${templateId || 'N/A'})`);
    } catch (error) {
      const errorDetails = axios.isAxiosError(error)
        ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          message: error.message,
        }
        : error;

      this.logger.error("Failed to send contact email via Plunk API", { errorDetails });

      const apiErrorMessage =
        axios.isAxiosError(error) && error.response?.data
          ? typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || JSON.stringify(error.response.data)
          : "";

      const extraMsg = apiErrorMessage ? ` (${apiErrorMessage})` : "";

      throw new ExternalServiceError(
        `Failed to deliver message via email provider${extraMsg}. Please try emailing directly.`
      );
    }
  }

  /**
   * Stage 5b: Delivery of Confirmation Email to Form Submitter via Plunk /v1/send
   * Triggered AFTER passing disposable email test and all security checks.
   */
  public async sendConfirmationEmail(payload: { name: string; email: string; subject: string; message: string; subscribe?: boolean }): Promise<void> {
    const secretKey = config.plunk.secretKey;
    const recipientEmail = config.contact.recipientEmail;
    const confirmationTemplateId = config.plunk.confirmationTemplateId || config.plunk.templateId;

    const { subject: emailSubject, html: emailBody } = renderContactConfirmationEmail({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      subscribed: payload.subscribe,
    });

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info("ℹ️ [SIMULATED CONFIRMATION EMAIL DELIVERY] Missing or placeholder PLUNK_SECRET_KEY detected in .env.");
      this.logger.info(`To Submitter: ${payload.email}`);
      this.logger.info(`Template ID: ${confirmationTemplateId}`);
      this.logger.info(`Subject: ${emailSubject}`);
      return;
    }

    try {
      const plunkPayload: Record<string, any> = {
        to: payload.email,
        reply: recipientEmail,
        subject: emailSubject,
        body: emailBody,
        data: {
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          subscribed: payload.subscribe ?? false,
        },
      };

      if (confirmationTemplateId) {
        plunkPayload.template = confirmationTemplateId;
      }

      await axios.post(`${config.plunk.apiUrl}/send`, plunkPayload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      this.logger.info(`✔ Confirmation email successfully sent to submitter ${payload.email} via Plunk (Template: ${confirmationTemplateId || 'N/A'})`);
    } catch (error) {
      this.logger.warn(`Failed to send confirmation email to submitter ${payload.email}`, { error });
      // Non-blocking: We do not crash the request if confirmation email delivery has a non-critical issue
    }
  }
}
