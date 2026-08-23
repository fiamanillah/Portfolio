// src/Modules/Newsletter/newsletter.dispatcher.ts
import crypto from "crypto";
import { prisma } from "@workspace/db";
import { config } from "@/core/config";
import { AppLogger } from "@workspace/logger";
import { PlunkTemplateService } from "@/services/PlunkTemplateService";
import { TemplateRenderer } from "@/services/TemplateRenderer";
import { renderEmailLayout } from "@/templates/emails/baseLayout";
import {
  type ResolvedRecipient,
  NewsletterRecipientResolver,
} from "./newsletter.recipient";

export interface DispatchOptions {
  batchSize?: number;
  batchDelayMs?: number;
}

export class NewsletterDispatcher {
  private static logger = new AppLogger("NewsletterDispatcher");

  /**
   * Generates a stateless HMAC-SHA256 signed unsubscribe URL.
   */
  public static buildUnsubscribeUrl(email: string): string {
    const secret = config.security.jwt.secret || "portfolio-unsub-secret";
    const normalizedEmail = email.trim().toLowerCase();
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(normalizedEmail)
      .digest("hex");
    const payload = `${normalizedEmail}:${hmac}`;
    const token = Buffer.from(payload).toString("base64url");
    return `${config.site.webUrl}/unsubscribe?token=${token}`;
  }

  /**
   * Dispatches a live campaign to all resolved recipients with rate limiting and logging.
   */
  public static async dispatchCampaign(
    newsletterId: string,
    options: DispatchOptions = {}
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
  }> {
    const { batchSize = 10, batchDelayMs = 150 } = options;

    // Atomically transition status to SENDING if currently DRAFT or SCHEDULED
    const updated = await prisma.newsletter.updateMany({
      where: {
        id: newsletterId,
        status: { in: ["DRAFT", "SCHEDULED"] },
      },
      data: {
        status: "SENDING",
      },
    });

    if (updated.count === 0) {
      this.logger.warn(
        `Newsletter ${newsletterId} is already SENDING, SENT, or CANCELLED. Skipping duplicate dispatch.`
      );
      return { total: 0, successful: 0, failed: 0 };
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      throw new Error(`Newsletter ${newsletterId} not found`);
    }

    this.logger.info(`Starting broadcast dispatch for newsletter "${newsletter.title}" (${newsletterId})`);

    // 1. Resolve eligible audience
    const { recipients } = await NewsletterRecipientResolver.resolveRecipients({
      targetAudience: newsletter.targetAudience as any,
      includedSources: newsletter.includedSources,
      includedTags: newsletter.includedTags,
      includedEmails: newsletter.includedEmails,
      excludedEmails: newsletter.excludedEmails,
      excludedSources: newsletter.excludedSources,
    });

    if (recipients.length === 0) {
      await prisma.newsletter.update({
        where: { id: newsletterId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          totalRecipients: 0,
          successfulSends: 0,
          failedSends: 0,
        },
      });
      this.logger.warn(`No eligible recipients for newsletter ${newsletterId}. Marked as SENT.`);
      return { total: 0, successful: 0, failed: 0 };
    }

    // 2. Pre-create send log records in DB in PENDING status
    await prisma.newsletterSendLog.deleteMany({
      where: { newsletterId },
    });

    await prisma.newsletterSendLog.createMany({
      data: recipients.map((r) => ({
        newsletterId,
        subscriberId: r.subscriberId,
        email: r.email,
        name: r.name,
        status: "PENDING",
      })),
    });

    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: {
        totalRecipients: recipients.length,
        successfulSends: 0,
        failedSends: 0,
      },
    });

    let successful = 0;
    let failed = 0;

    const senderFrom =
      newsletter.senderEmail ||
      config.email.newsletterFrom ||
      "newsletter@newsletter.amanillah.com";
    const senderName = newsletter.senderName || "Fi Amanillah";
    const replyTo =
      newsletter.replyTo || config.email.replyTo || "fi@amanillah.com";

    // 3. Process in batches with throttling
    for (let i = 0; i < recipients.length; i += batchSize) {
      // Check if campaign was cancelled during dispatch
      const currentStatus = await prisma.newsletter.findUnique({
        where: { id: newsletterId },
        select: { status: true },
      });

      if (currentStatus?.status === "CANCELLED") {
        this.logger.warn(`Newsletter ${newsletterId} was CANCELLED during active dispatch.`);
        break;
      }

      const batch = recipients.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (recipient) => {
          const unsubUrl = this.buildUnsubscribeUrl(recipient.email);
          const firstName = recipient.name?.split(" ")[0] || "there";

          const context = {
            name: recipient.name || "Subscriber",
            firstName,
            email: recipient.email,
            title: newsletter.title,
            subject: newsletter.subject,
            previewText: newsletter.previewText || newsletter.subject,
            unsubscribeUrl: unsubUrl,
            siteUrl: config.site.webUrl,
            year: new Date().getFullYear(),
          };

          try {
            // Render subject with variables
            const renderedSubject = await TemplateRenderer.renderString(
              newsletter.subject,
              context
            );

            // Render content body with variables
            const renderedContent = await TemplateRenderer.renderString(
              newsletter.content,
              context
            );

            // Wrap into complete compliant email layout
            const { html, listUnsubscribeHeader } = renderEmailLayout({
              title: renderedSubject,
              badgeLabel: "Newsletter",
              contentHtml: renderedContent,
              previewText: newsletter.previewText || "",
              unsubscribeUrl: unsubUrl,
              showUnsubscribe: true,
            });

            // Dispatch email via Plunk with anti-spam RFC headers
            await PlunkTemplateService.sendWithTemplate({
              to: recipient.email,
              from: senderFrom,
              fromName: senderName,
              reply: replyTo,
              subject: renderedSubject,
              body: html,
              headers: {
                "List-Unsubscribe": listUnsubscribeHeader,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                "X-Entity-Ref-ID": newsletterId,
                "Feedback-ID": `newsletter:${newsletterId}:${senderFrom}`,
                Precedence: "bulk",
              },
            });

            successful++;

            // Update individual log entry
            await prisma.newsletterSendLog.updateMany({
              where: {
                newsletterId,
                email: recipient.email,
              },
              data: {
                status: "SENT",
                sentAt: new Date(),
                error: null,
              },
            });
          } catch (err: any) {
            failed++;
            const errorMsg = err?.message || String(err);
            this.logger.error(`Failed to send newsletter to ${recipient.email}: ${errorMsg}`);

            await prisma.newsletterSendLog.updateMany({
              where: {
                newsletterId,
                email: recipient.email,
              },
              data: {
                status: "FAILED",
                error: errorMsg,
              },
            });
          }
        })
      );

      // Periodically update aggregate counts on the newsletter entity
      await prisma.newsletter.update({
        where: { id: newsletterId },
        data: {
          successfulSends: successful,
          failedSends: failed,
        },
      });

      // Throttle delay between batches
      if (i + batchSize < recipients.length && batchDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
      }
    }

    const finalStatus =
      successful === 0 && failed > 0 ? "FAILED" : "SENT";

    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: {
        status: finalStatus,
        sentAt: new Date(),
        successfulSends: successful,
        failedSends: failed,
      },
    });

    this.logger.info(
      `Newsletter ${newsletterId} broadcast finished: ${successful} sent, ${failed} failed of ${recipients.length} total.`
    );

    return {
      total: recipients.length,
      successful,
      failed,
    };
  }

  /**
   * Sends a realistic test newsletter to one or more test email addresses.
   */
  public static async sendTest(params: {
    subject: string;
    previewText?: string | null;
    content: string;
    testEmails: string[];
    senderName?: string | null;
    senderEmail?: string | null;
  }): Promise<{
    successful: number;
    failed: number;
    recipients: string[];
  }> {
    const {
      subject,
      previewText,
      content,
      testEmails,
      senderName,
      senderEmail,
    } = params;

    let successful = 0;
    let failed = 0;

    const from =
      senderEmail ||
      config.email.newsletterFrom ||
      "newsletter@newsletter.amanillah.com";
    const fromName = senderName || "Fi Amanillah (Test)";

    for (const email of testEmails) {
      const unsubUrl = this.buildUnsubscribeUrl(email);
      const context = {
        name: "Test Recipient",
        firstName: "Test",
        email,
        subject,
        previewText: previewText || subject,
        unsubscribeUrl: unsubUrl,
        siteUrl: config.site.webUrl,
        year: new Date().getFullYear(),
      };

      try {
        const renderedSubject = `[TEST] ${await TemplateRenderer.renderString(subject, context)}`;
        const renderedContent = await TemplateRenderer.renderString(
          content,
          context
        );

        const { html, listUnsubscribeHeader } = renderEmailLayout({
          title: renderedSubject,
          badgeLabel: "Test Broadcast",
          contentHtml: renderedContent,
          previewText: previewText || "",
          unsubscribeUrl: unsubUrl,
          showUnsubscribe: true,
        });

        await PlunkTemplateService.sendWithTemplate({
          to: email,
          from,
          fromName,
          subject: renderedSubject,
          body: html,
          headers: {
            "List-Unsubscribe": listUnsubscribeHeader,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            "X-Test-Email": "true",
          },
        });

        successful++;
      } catch (err: any) {
        failed++;
        this.logger.error(`Error sending test newsletter to ${email}:`, {
          error: err?.message || err,
        });
      }
    }

    return {
      successful,
      failed,
      recipients: testEmails,
    };
  }
}
