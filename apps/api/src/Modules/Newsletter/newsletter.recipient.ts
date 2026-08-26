// src/Modules/Newsletter/newsletter.recipient.ts
import { prisma, Prisma } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import type { AudienceType, RecipientCalculationResult } from "@workspace/shared";

export interface ResolvedRecipient {
  subscriberId?: string;
  email: string;
  name?: string | null;
  source?: string | null;
  reason: "active_subscriber" | "custom_include";
}

export interface ResolveAudienceOptions {
  targetAudience?: AudienceType;
  includedSources?: string[];
  includedTags?: string[];
  includedEmails?: string[];
  excludedEmails?: string[];
  excludedSources?: string[];
}

export class NewsletterRecipientResolver {
  private static logger = new AppLogger("NewsletterRecipientResolver");

  /**
   * Resolves the full, deduplicated recipient list for a campaign applying all inclusion & exclusion filters.
   */
  public static async resolveRecipients(
    options: ResolveAudienceOptions = {}
  ): Promise<{
    recipients: ResolvedRecipient[];
    stats: RecipientCalculationResult;
  }> {
    const {
      targetAudience = "ALL",
      includedSources = [],
      includedEmails = [],
      excludedEmails = [],
      excludedSources = [],
    } = options;

    const normalizedExcludedEmails = new Set(
      excludedEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
    );
    const normalizedExcludedSources = new Set(
      excludedSources.map((s) => s.trim().toLowerCase()).filter(Boolean)
    );

    const recipientMap = new Map<string, ResolvedRecipient>();
    let totalSubscribers = 0;
    let excludedCount = 0;

    // 1. Fetch active subscribers if targetAudience is not strictly custom
    if (targetAudience !== "CUSTOM") {
      const whereClause: Prisma.SubscriberWhereInput = {
        status: "subscribed",
      };

      if (
        targetAudience === "SEGMENT" &&
        includedSources.length > 0 &&
        !includedSources.includes("ALL")
      ) {
        whereClause.source = { in: includedSources };
      }

      const activeSubscribers = await prisma.subscriber.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          source: true,
        },
      });

      totalSubscribers = activeSubscribers.length;

      for (const sub of activeSubscribers) {
        const normEmail = sub.email.trim().toLowerCase();

        // Check if source is excluded
        if (sub.source && normalizedExcludedSources.has(sub.source.toLowerCase())) {
          excludedCount++;
          continue;
        }

        // Check if email is explicitly excluded
        if (normalizedExcludedEmails.has(normEmail)) {
          excludedCount++;
          continue;
        }

        recipientMap.set(normEmail, {
          subscriberId: sub.id,
          email: normEmail,
          name: sub.name,
          source: sub.source,
          reason: "active_subscriber",
        });
      }
    }

    // 2. Add Explicitly Included Emails
    let includedCustomCount = 0;
    for (const rawEmail of includedEmails) {
      const normEmail = rawEmail.trim().toLowerCase();
      if (!normEmail || !normEmail.includes("@")) continue;

      // Exclusions take precedence
      if (normalizedExcludedEmails.has(normEmail)) {
        excludedCount++;
        continue;
      }

      if (!recipientMap.has(normEmail)) {
        recipientMap.set(normEmail, {
          email: normEmail,
          name: null,
          source: "manual_inclusion",
          reason: "custom_include",
        });
        includedCustomCount++;
      }
    }

    const recipients = Array.from(recipientMap.values());
    const previewRecipients = recipients.slice(0, 15);

    const stats: RecipientCalculationResult = {
      totalCount: recipients.length,
      totalSubscribers,
      includedCustomCount,
      excludedCount,
      previewRecipients,
    };

    this.logger.info(
      `Resolved ${recipients.length} recipients (Audience: ${targetAudience}, Custom Included: ${includedCustomCount}, Excluded: ${excludedCount})`
    );

    return { recipients, stats };
  }
}
