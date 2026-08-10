// src/Modules/Contact/contact.service.ts
import axios from "axios";
import { config } from "@/core/config";
import { AppLogger } from "@/core/logging/logger";
import { AppError, BadRequestError, ExternalServiceError } from "@/core/errors/AppError";

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
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
      trimmed.startsWith("0x4aaaaaaa")
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
      const response = await axios.get(`https://next-api.useplunk.com/v1/verify?email=${encodeURIComponent(email)}`, {
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
   * Stage 5a: Delivery of Admin Notification via Plunk /v1/send with Plunk Template support
   */
  public async sendContactEmail(payload: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const secretKey = config.plunk.secretKey;
    const recipientEmail = config.contact.recipientEmail;
    const templateId = config.plunk.templateId;

    const emailSubject = payload.subject ? `[Portfolio Contact] ${payload.subject}` : `[Portfolio Contact] Message from ${payload.name}`;
    const emailBody = `
<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">New Portfolio Contact Message</h2>
    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Received via portfolio defense-in-depth contact form</p>
  </div>
  
  <div style="margin-bottom: 16px;">
    <p style="margin: 4px 0; font-size: 14px;"><strong>From:</strong> ${payload.name} (&lt;<a href="mailto:${payload.email}" style="color: #10b981; text-decoration: none;">${payload.email}</a>&gt;)</p>
    <p style="margin: 4px 0; font-size: 14px;"><strong>Subject:</strong> ${payload.subject}</p>
  </div>

  <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 16px; margin-top: 16px;">
    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em;">Message Content</p>
    <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151;">${payload.message}</div>
  </div>

  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
    Sent from Fi Amanillah's Portfolio System
  </div>
</div>
    `.trim();

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
  public async sendConfirmationEmail(payload: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const secretKey = config.plunk.secretKey;
    const recipientEmail = config.contact.recipientEmail;
    const confirmationTemplateId = config.plunk.confirmationTemplateId || config.plunk.templateId;

    const emailSubject = `[Confirmation] Thank you for getting in touch! - Fi Amanillah`;
    const emailBody = `
<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">Thank You for Getting in Touch!</h2>
    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">Your message has been successfully received</p>
  </div>
  
  <p style="font-size: 15px; line-height: 1.6; color: #374151;">Hi <strong>${payload.name}</strong>,</p>
  <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
    Thank you for reaching out. I have received your message regarding "<strong>${payload.subject}</strong>" and will review it as soon as possible.
  </p>

  <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em;">Copy of your message</p>
    <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #4b5563;">${payload.message}</div>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
    If your inquiry is urgent, feel free to reply directly to this email.
  </p>

  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
    Best regards,<br/>
    <strong>Fi Amanillah</strong>
  </div>
</div>
    `.trim();

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
        },
      };

      if (confirmationTemplateId) {
        plunkPayload.template = confirmationTemplateId;
      }

      await axios.post("https://next-api.useplunk.com/v1/send", plunkPayload, {
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
