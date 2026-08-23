// src/Modules/Newsletter/newsletter.service.ts
import { prisma } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import { config } from "@/core/config";
import {
  BadRequestError,
  NotFoundError,
} from "@/core/errors/AppError";
import type {
  CreateNewsletterDTO,
  UpdateNewsletterDTO,
  ListNewslettersQueryDTO,
  CalculateRecipientsDTO,
  SendTestNewsletterDTO,
  ScheduleNewsletterDTO,
  SpamCheckDTO,
  ListNewsletterLogsQueryDTO,
  NewsletterItem,
  NewsletterDetail,
  NewsletterStats,
  NewsletterSendLogItem,
} from "@workspace/shared";
import { NewsletterSpamAnalyzer } from "./newsletter.spam-analyzer";
import { NewsletterRecipientResolver } from "./newsletter.recipient";
import { NewsletterDispatcher } from "./newsletter.dispatcher";
import {
  PlunkCampaignService,
  type PlunkCampaignResponse,
} from "@/services/PlunkCampaignService";

export class NewsletterService {
  private logger = new AppLogger("NewsletterService");

  /**
   * 1. Get KPI Statistics for Newsletters
   */
  public async getStats(): Promise<NewsletterStats> {
    const totalCampaigns = await prisma.newsletter.count();
    const draftsCount = await prisma.newsletter.count({
      where: { status: "DRAFT" },
    });
    const scheduledCount = await prisma.newsletter.count({
      where: { status: "SCHEDULED" },
    });
    const sendingCount = await prisma.newsletter.count({
      where: { status: "SENDING" },
    });
    const sentCount = await prisma.newsletter.count({
      where: { status: "SENT" },
    });

    const aggregates = await prisma.newsletter.aggregate({
      _sum: {
        successfulSends: true,
        failedSends: true,
        deliveredCount: true,
      },
    });

    const totalEmailsSent =
      aggregates._sum.deliveredCount ||
      aggregates._sum.successfulSends ||
      0;
    const totalEmailsFailed = aggregates._sum.failedSends || 0;
    const totalAttempts = totalEmailsSent + totalEmailsFailed;
    const averageDeliveryRate =
      totalAttempts > 0
        ? Math.round((totalEmailsSent / totalAttempts) * 100)
        : 100;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCampaigns7d = await prisma.newsletter.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    return {
      totalCampaigns,
      draftsCount,
      scheduledCount,
      sendingCount,
      sentCount,
      totalEmailsSent,
      totalEmailsFailed,
      averageDeliveryRate,
      recentCampaigns7d,
    };
  }

  /**
   * 2. List Newsletters with Filters, Search, and Pagination
   */
  public async list(query: Partial<ListNewslettersQueryDTO> = {}): Promise<{
    items: NewsletterItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const page = Math.max(
      1,
      typeof query.page === "number"
        ? query.page
        : parseInt(String(query.page || 1), 10) || 1
    );
    const limit = Math.min(
      100,
      Math.max(
        1,
        typeof query.limit === "number"
          ? query.limit
          : parseInt(String(query.limit || 20), 10) || 20
      )
    );

    const {
      search,
      status,
      targetAudience,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { subject: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (targetAudience && targetAudience !== "ALL") {
      where.targetAudience = targetAudience;
    }

    const [total, records] = await Promise.all([
      prisma.newsletter.count({ where }),
      prisma.newsletter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          subject: true,
          previewText: true,
          status: true,
          templateId: true,
          plunkCampaignId: true,
          senderName: true,
          senderEmail: true,
          targetAudience: true,
          totalRecipients: true,
          successfulSends: true,
          failedSends: true,
          deliveredCount: true,
          openedCount: true,
          clickedCount: true,
          bouncedCount: true,
          spamScore: true,
          scheduledAt: true,
          sentAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const items: NewsletterItem[] = records.map((r) => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      previewText: r.previewText,
      status: r.status as any,
      templateId: r.templateId,
      plunkCampaignId: r.plunkCampaignId,
      senderName: r.senderName,
      senderEmail: r.senderEmail,
      targetAudience: r.targetAudience as any,
      totalRecipients: r.totalRecipients,
      successfulSends: r.successfulSends,
      failedSends: r.failedSends,
      deliveredCount: r.deliveredCount,
      openedCount: r.openedCount,
      clickedCount: r.clickedCount,
      bouncedCount: r.bouncedCount,
      spamScore: r.spamScore,
      scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * 3. Get single Newsletter by ID with full details & Plunk stats sync
   */
  public async getById(id: string): Promise<NewsletterDetail> {
    const record = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundError(`Newsletter campaign ${id} not found.`);
    }

    // Sync stats from Plunk if plunkCampaignId exists
    let updatedRecord = record;
    if (record.plunkCampaignId) {
      try {
        const stats = await PlunkCampaignService.getCampaignStats(
          record.plunkCampaignId
        );
        if (stats && (stats.sentCount > 0 || stats.deliveredCount > 0)) {
          updatedRecord = await prisma.newsletter.update({
            where: { id },
            data: {
              totalRecipients: stats.totalRecipients || record.totalRecipients,
              successfulSends: stats.sentCount || record.successfulSends,
              deliveredCount: stats.deliveredCount || record.deliveredCount,
              openedCount: stats.openedCount || record.openedCount,
              clickedCount: stats.clickedCount || record.clickedCount,
              bouncedCount: stats.bouncedCount || record.bouncedCount,
            },
          });
        }
      } catch (err) {
        this.logger.debug(
          `Non-critical: could not sync stats from Plunk for ${record.plunkCampaignId}`,
          { error: err }
        );
      }
    }

    const spamReport = updatedRecord.spamReport
      ? (updatedRecord.spamReport as any)
      : NewsletterSpamAnalyzer.analyze({
          subject: updatedRecord.subject,
          previewText: updatedRecord.previewText,
          content: updatedRecord.content,
          senderEmail: updatedRecord.senderEmail,
        });

    return {
      id: updatedRecord.id,
      title: updatedRecord.title,
      subject: updatedRecord.subject,
      previewText: updatedRecord.previewText,
      content: updatedRecord.content,
      status: updatedRecord.status as any,
      templateId: updatedRecord.templateId,
      plunkCampaignId: updatedRecord.plunkCampaignId,
      senderName: updatedRecord.senderName,
      senderEmail: updatedRecord.senderEmail,
      replyTo: updatedRecord.replyTo,
      targetAudience: updatedRecord.targetAudience as any,
      includedSources: updatedRecord.includedSources,
      includedTags: updatedRecord.includedTags,
      includedEmails: updatedRecord.includedEmails,
      excludedEmails: updatedRecord.excludedEmails,
      excludedSources: updatedRecord.excludedSources,
      totalRecipients: updatedRecord.totalRecipients,
      successfulSends: updatedRecord.successfulSends,
      failedSends: updatedRecord.failedSends,
      deliveredCount: updatedRecord.deliveredCount,
      openedCount: updatedRecord.openedCount,
      clickedCount: updatedRecord.clickedCount,
      bouncedCount: updatedRecord.bouncedCount,
      spamScore: updatedRecord.spamScore ?? spamReport.score,
      spamReport,
      metadata: updatedRecord.metadata
        ? (updatedRecord.metadata as Record<string, any>)
        : null,
      scheduledAt: updatedRecord.scheduledAt
        ? updatedRecord.scheduledAt.toISOString()
        : null,
      sentAt: updatedRecord.sentAt
        ? updatedRecord.sentAt.toISOString()
        : null,
      createdAt: updatedRecord.createdAt.toISOString(),
      updatedAt: updatedRecord.updatedAt.toISOString(),
    };
  }

  /**
   * 4. Create a new Newsletter & Sync to Plunk Campaigns
   */
  public async create(payload: CreateNewsletterDTO): Promise<NewsletterDetail> {
    const spamReport = NewsletterSpamAnalyzer.analyze({
      subject: payload.subject,
      previewText: payload.previewText,
      content: payload.content,
      senderEmail: payload.senderEmail,
    });

    const scheduledAt = payload.scheduledAt
      ? new Date(payload.scheduledAt)
      : null;

    const initialStatus = scheduledAt ? "SCHEDULED" : "DRAFT";

    // 1. Create Campaign in Plunk
    let plunkCampaignId: string | null = null;
    try {
      const plunkCamp = await PlunkCampaignService.createCampaign({
        name: payload.title,
        description: payload.previewText || undefined,
        subject: payload.subject,
        body: payload.content,
        from:
          payload.senderEmail ||
          config.email.newsletterFrom ||
          "newsletter@newsletter.amanillah.com",
        fromName: payload.senderName || "Fi Amanillah",
        replyTo:
          payload.replyTo ||
          config.email.replyTo ||
          "fi@amanillah.com",
        type: "MARKETING",
        audienceType:
          payload.targetAudience === "SEGMENT" ? "SEGMENT" : "ALL",
      });
      plunkCampaignId = plunkCamp.id;
    } catch (plunkErr: any) {
      this.logger.warn(
        `Failed to create Plunk campaign upstream, saving locally: ${plunkErr?.message}`
      );
    }

    // 2. Save locally in PostgreSQL
    const created = await prisma.newsletter.create({
      data: {
        title: payload.title,
        subject: payload.subject,
        previewText: payload.previewText,
        content: payload.content,
        status: initialStatus,
        templateId: payload.templateId,
        plunkCampaignId,
        senderName: payload.senderName,
        senderEmail: payload.senderEmail,
        replyTo: payload.replyTo,
        targetAudience: payload.targetAudience,
        includedSources: payload.includedSources || [],
        includedTags: payload.includedTags || [],
        includedEmails: payload.includedEmails || [],
        excludedEmails: payload.excludedEmails || [],
        excludedSources: payload.excludedSources || [],
        scheduledAt,
        spamScore: spamReport.score,
        spamReport: spamReport as any,
        metadata: (payload.metadata as any) || undefined,
      },
    });

    this.logger.info(
      `Created newsletter campaign: "${created.title}" (DB: ${created.id}, Plunk: ${plunkCampaignId || "None"})`
    );
    return this.getById(created.id);
  }

  /**
   * 5. Update an existing Newsletter & Sync with Plunk
   */
  public async update(
    id: string,
    payload: UpdateNewsletterDTO
  ): Promise<NewsletterDetail> {
    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Newsletter ${id} not found.`);
    }

    if (existing.status === "SENDING") {
      throw new BadRequestError(
        "Cannot edit a campaign that is currently sending."
      );
    }

    const updatedSubject = payload.subject ?? existing.subject;
    const updatedPreview =
      payload.previewText !== undefined
        ? payload.previewText
        : existing.previewText;
    const updatedContent = payload.content ?? existing.content;
    const updatedSenderEmail =
      payload.senderEmail !== undefined
        ? payload.senderEmail
        : existing.senderEmail;
    const updatedSenderName =
      payload.senderName !== undefined
        ? payload.senderName
        : existing.senderName;
    const updatedReplyTo =
      payload.replyTo !== undefined ? payload.replyTo : existing.replyTo;
    const updatedTitle = payload.title ?? existing.title;
    const updatedAudience = payload.targetAudience ?? existing.targetAudience;

    const spamReport = NewsletterSpamAnalyzer.analyze({
      subject: updatedSubject,
      previewText: updatedPreview,
      content: updatedContent,
      senderEmail: updatedSenderEmail,
    });

    const scheduledAt =
      payload.scheduledAt !== undefined
        ? payload.scheduledAt
          ? new Date(payload.scheduledAt)
          : null
        : existing.scheduledAt;

    let newStatus = existing.status;
    if (scheduledAt && new Date(scheduledAt).getTime() > Date.now()) {
      newStatus = "SCHEDULED";
    } else if (existing.status === "SCHEDULED" && !scheduledAt) {
      newStatus = "DRAFT";
    }

    // 1. Sync Update with Plunk if exists or create if missing
    let plunkCampaignId = existing.plunkCampaignId;
    try {
      if (plunkCampaignId) {
        await PlunkCampaignService.updateCampaign(plunkCampaignId, {
          name: updatedTitle,
          description: updatedPreview || undefined,
          subject: updatedSubject,
          body: updatedContent,
          from:
            updatedSenderEmail ||
            config.email.newsletterFrom ||
            "newsletter@newsletter.amanillah.com",
          fromName: updatedSenderName || "Fi Amanillah",
          replyTo:
            updatedReplyTo ||
            config.email.replyTo ||
            "fi@amanillah.com",
          type: "MARKETING",
          audienceType: updatedAudience === "SEGMENT" ? "SEGMENT" : "ALL",
        });
      } else {
        const plunkCamp = await PlunkCampaignService.createCampaign({
          name: updatedTitle,
          description: updatedPreview || undefined,
          subject: updatedSubject,
          body: updatedContent,
          from:
            updatedSenderEmail ||
            config.email.newsletterFrom ||
            "newsletter@newsletter.amanillah.com",
          fromName: updatedSenderName || "Fi Amanillah",
          replyTo:
            updatedReplyTo ||
            config.email.replyTo ||
            "fi@amanillah.com",
          type: "MARKETING",
          audienceType: updatedAudience === "SEGMENT" ? "SEGMENT" : "ALL",
        });
        plunkCampaignId = plunkCamp.id;
      }
    } catch (plunkErr: any) {
      this.logger.warn(
        `Non-critical: Plunk campaign update failed: ${plunkErr?.message}`
      );
    }

    // 2. Save locally
    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        ...(payload.title ? { title: payload.title } : {}),
        ...(payload.subject ? { subject: payload.subject } : {}),
        ...(payload.previewText !== undefined
          ? { previewText: payload.previewText }
          : {}),
        ...(payload.content ? { content: payload.content } : {}),
        ...(payload.templateId !== undefined
          ? { templateId: payload.templateId }
          : {}),
        plunkCampaignId,
        ...(payload.senderName !== undefined
          ? { senderName: payload.senderName }
          : {}),
        ...(payload.senderEmail !== undefined
          ? { senderEmail: payload.senderEmail }
          : {}),
        ...(payload.replyTo !== undefined ? { replyTo: payload.replyTo } : {}),
        ...(payload.targetAudience
          ? { targetAudience: payload.targetAudience }
          : {}),
        ...(payload.includedSources
          ? { includedSources: payload.includedSources }
          : {}),
        ...(payload.includedTags ? { includedTags: payload.includedTags } : {}),
        ...(payload.includedEmails
          ? { includedEmails: payload.includedEmails }
          : {}),
        ...(payload.excludedEmails
          ? { excludedEmails: payload.excludedEmails }
          : {}),
        ...(payload.excludedSources
          ? { excludedSources: payload.excludedSources }
          : {}),
        scheduledAt,
        status: newStatus,
        spamScore: spamReport.score,
        spamReport: spamReport as any,
        ...(payload.metadata !== undefined
          ? { metadata: (payload.metadata as any) || undefined }
          : {}),
      },
    });

    this.logger.info(`Updated newsletter campaign ${updated.id}`);
    return this.getById(updated.id);
  }

  /**
   * 6. Delete a Newsletter & Delete upstream from Plunk
   */
  public async delete(id: string): Promise<void> {
    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Newsletter ${id} not found.`);
    }

    if (existing.status === "SENDING") {
      throw new BadRequestError(
        "Cannot delete a campaign that is currently sending."
      );
    }

    // Delete upstream in Plunk
    if (existing.plunkCampaignId) {
      await PlunkCampaignService.deleteCampaign(
        existing.plunkCampaignId
      ).catch((err) => {
        this.logger.warn(`Could not delete campaign in Plunk: ${err?.message}`);
      });
    }

    // Delete in PostgreSQL (cascades logs)
    await prisma.newsletter.delete({
      where: { id },
    });

    this.logger.info(`Deleted newsletter ${id}`);
  }

  /**
   * 7. Duplicate an existing Newsletter
   */
  public async duplicate(id: string): Promise<NewsletterDetail> {
    const source = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!source) {
      throw new NotFoundError(`Source newsletter ${id} not found.`);
    }

    // Duplicate in Plunk
    let newPlunkCampaignId: string | null = null;
    if (source.plunkCampaignId) {
      try {
        const duplicatedPlunk =
          await PlunkCampaignService.duplicateCampaign(source.plunkCampaignId);
        newPlunkCampaignId = duplicatedPlunk.id;
      } catch (err: any) {
        this.logger.warn(
          `Could not duplicate in Plunk directly: ${err?.message}`
        );
      }
    }

    const duplicated = await prisma.newsletter.create({
      data: {
        title: `Copy of ${source.title}`,
        subject: source.subject,
        previewText: source.previewText,
        content: source.content,
        status: "DRAFT",
        templateId: source.templateId,
        plunkCampaignId: newPlunkCampaignId,
        senderName: source.senderName,
        senderEmail: source.senderEmail,
        replyTo: source.replyTo,
        targetAudience: source.targetAudience,
        includedSources: source.includedSources,
        includedTags: source.includedTags,
        includedEmails: source.includedEmails,
        excludedEmails: source.excludedEmails,
        excludedSources: source.excludedSources,
        spamScore: source.spamScore,
        spamReport: source.spamReport as any,
        metadata: (source.metadata as any) || undefined,
        totalRecipients: 0,
        successfulSends: 0,
        failedSends: 0,
      },
    });

    this.logger.info(
      `Duplicated newsletter ${id} -> ${duplicated.id} (Plunk: ${newPlunkCampaignId || "None"})`
    );
    return this.getById(duplicated.id);
  }

  /**
   * 8. Calculate Target Recipients dynamically
   */
  public async calculateRecipients(dto: CalculateRecipientsDTO) {
    const { recipients, stats } =
      await NewsletterRecipientResolver.resolveRecipients(dto);

    return {
      totalCount: stats.totalCount,
      totalSubscribers: stats.totalSubscribers,
      includedCustomCount: stats.includedCustomCount,
      excludedCount: stats.excludedCount,
      previewRecipients: recipients.slice(0, 15),
    };
  }

  /**
   * 9. Real-time Spam & Deliverability Audit
   */
  public spamCheck(payload: SpamCheckDTO) {
    return NewsletterSpamAnalyzer.analyze({
      subject: payload.subject,
      previewText: payload.previewText,
      content: payload.content,
      senderEmail: payload.senderEmail,
    });
  }

  /**
   * 10. Send a Test Newsletter (via Plunk /campaigns/:id/test and local dispatcher)
   */
  public async sendTest(payload: SendTestNewsletterDTO) {
    let subject = payload.subject;
    let previewText = payload.previewText;
    let content = payload.content;
    let senderName = payload.senderName;
    let senderEmail = payload.senderEmail;
    let plunkCampaignId: string | null = null;

    if (payload.newsletterId) {
      const newsletter = await prisma.newsletter.findUnique({
        where: { id: payload.newsletterId },
      });
      if (newsletter) {
        subject = subject || newsletter.subject;
        previewText =
          previewText !== undefined
            ? previewText
            : newsletter.previewText;
        content = content || newsletter.content;
        senderName = senderName || newsletter.senderName;
        senderEmail = senderEmail || newsletter.senderEmail;
        plunkCampaignId = newsletter.plunkCampaignId;
      }
    }

    if (!subject || !content) {
      throw new BadRequestError(
        "Subject and content are required to dispatch a test newsletter."
      );
    }

    // Try testing via Plunk Campaign Test endpoint if campaign exists in Plunk
    if (plunkCampaignId) {
      for (const email of payload.testEmails) {
        try {
          await PlunkCampaignService.testCampaign(plunkCampaignId, email);
        } catch (err: any) {
          this.logger.warn(
            `Plunk test send failed for ${email}: ${err?.message}, falling back to direct dispatcher`
          );
        }
      }
    }

    // Always dispatch rich rendered email via local dispatcher for reliable inbox delivery & testing
    return await NewsletterDispatcher.sendTest({
      subject,
      previewText,
      content,
      testEmails: payload.testEmails,
      senderName,
      senderEmail,
    });
  }

  /**
   * 11. Send Campaign Immediately & Trigger Plunk Broadcast
   */
  public async sendNow(id: string) {
    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Newsletter ${id} not found.`);
    }

    if (existing.status === "SENDING") {
      throw new BadRequestError(
        "This campaign is already currently sending."
      );
    }

    // 1. Trigger Plunk Campaign Send if exists
    if (existing.plunkCampaignId) {
      try {
        await PlunkCampaignService.sendCampaign(existing.plunkCampaignId, {});
        this.logger.info(
          `✔ Triggered Plunk campaign send for ${existing.plunkCampaignId}`
        );
      } catch (err: any) {
        this.logger.warn(
          `Plunk campaign send failed: ${err?.message}. Continuing with local dispatcher.`
        );
      }
    }

    // 2. Trigger asynchronous rate-limited batch dispatch with RFC 8058 headers & DB logging
    NewsletterDispatcher.dispatchCampaign(id).catch((err) => {
      this.logger.error(`Error in background dispatch for newsletter ${id}:`, {
        error: err?.message || err,
      });
    });

    return {
      success: true,
      message: `Newsletter "${existing.title}" is now broadcasting to your audience.`,
      newsletterId: id,
    };
  }

  /**
   * 12. Schedule a Campaign for future date & Sync with Plunk
   */
  public async schedule(id: string, payload: ScheduleNewsletterDTO) {
    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Newsletter ${id} not found.`);
    }

    const scheduledDate = new Date(payload.scheduledAt);
    if (scheduledDate.getTime() <= Date.now()) {
      throw new BadRequestError("Scheduled time must be in the future.");
    }

    // Schedule upstream in Plunk
    if (existing.plunkCampaignId) {
      try {
        await PlunkCampaignService.sendCampaign(existing.plunkCampaignId, {
          scheduledFor: scheduledDate.toISOString(),
        });
      } catch (err: any) {
        this.logger.warn(`Plunk schedule upstream warning: ${err?.message}`);
      }
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        scheduledAt: scheduledDate,
        status: "SCHEDULED",
      },
    });

    this.logger.info(
      `Scheduled newsletter ${id} for ${scheduledDate.toISOString()}`
    );
    return this.getById(updated.id);
  }

  /**
   * 13. Cancel a Scheduled or Sending Campaign & Cancel in Plunk
   */
  public async cancel(id: string) {
    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Newsletter ${id} not found.`);
    }

    // Cancel in Plunk
    if (existing.plunkCampaignId) {
      try {
        await PlunkCampaignService.cancelCampaign(existing.plunkCampaignId);
      } catch (err: any) {
        this.logger.warn(`Plunk cancel upstream warning: ${err?.message}`);
      }
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    this.logger.info(`Cancelled newsletter campaign ${id}`);
    return this.getById(updated.id);
  }

  /**
   * 14. Synchronize all campaigns from Plunk to Local Database
   */
  public async syncWithPlunk(id: string): Promise<NewsletterDetail> {
    const record = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundError(`Newsletter ${id} not found.`);
    }

    if (!record.plunkCampaignId) {
      // Create campaign in Plunk
      const plunkCamp = await PlunkCampaignService.createCampaign({
        name: record.title,
        description: record.previewText || undefined,
        subject: record.subject,
        body: record.content,
        from:
          record.senderEmail ||
          config.email.newsletterFrom ||
          "newsletter@newsletter.amanillah.com",
        fromName: record.senderName || "Fi Amanillah",
        replyTo:
          record.replyTo ||
          config.email.replyTo ||
          "fi@amanillah.com",
        type: "MARKETING",
        audienceType: record.targetAudience === "SEGMENT" ? "SEGMENT" : "ALL",
      });

      await prisma.newsletter.update({
        where: { id },
        data: { plunkCampaignId: plunkCamp.id },
      });
    } else {
      // Pull stats from Plunk
      const [plunkCamp, stats] = await Promise.all([
        PlunkCampaignService.getCampaign(record.plunkCampaignId).catch(
          () => null
        ),
        PlunkCampaignService.getCampaignStats(record.plunkCampaignId).catch(
          () => null
        ),
      ]);

      if (plunkCamp || stats) {
        await prisma.newsletter.update({
          where: { id },
          data: {
            ...(plunkCamp?.status
              ? { status: plunkCamp.status as any }
              : {}),
            totalRecipients:
              stats?.totalRecipients ||
              plunkCamp?.totalRecipients ||
              record.totalRecipients,
            successfulSends:
              stats?.sentCount ||
              plunkCamp?.sentCount ||
              record.successfulSends,
            deliveredCount:
              stats?.deliveredCount ||
              plunkCamp?.deliveredCount ||
              record.deliveredCount,
            openedCount:
              stats?.openedCount ||
              plunkCamp?.openedCount ||
              record.openedCount,
            clickedCount:
              stats?.clickedCount ||
              plunkCamp?.clickedCount ||
              record.clickedCount,
            bouncedCount:
              stats?.bouncedCount ||
              plunkCamp?.bouncedCount ||
              record.bouncedCount,
          },
        });
      }
    }

    return this.getById(id);
  }

  /**
   * 15. Get Per-Recipient Delivery Logs
   */
  public async getLogs(
    newsletterId: string,
    query: Partial<ListNewsletterLogsQueryDTO> = {}
  ): Promise<{
    items: NewsletterSendLogItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    counts: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
    };
  }> {
    const page = Math.max(
      1,
      typeof query.page === "number"
        ? query.page
        : parseInt(String(query.page || 1), 10) || 1
    );
    const limit = Math.min(
      100,
      Math.max(
        1,
        typeof query.limit === "number"
          ? query.limit
          : parseInt(String(query.limit || 50), 10) || 50
      )
    );

    const {
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      newsletterId,
    };

    if (search && search.trim()) {
      where.OR = [
        { email: { contains: search.trim(), mode: "insensitive" } },
        { name: { contains: search.trim(), mode: "insensitive" } },
        { error: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [total, records, counts] = await Promise.all([
      prisma.newsletterSendLog.count({ where }),
      prisma.newsletterSendLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.newsletterSendLog
        .groupBy({
          by: ["status"],
          where: { newsletterId },
          _count: { status: true },
        })
        .then((groups) => {
          let sent = 0;
          let failed = 0;
          let pending = 0;
          for (const g of groups) {
            if (g.status === "SENT") sent += g._count.status;
            else if (g.status === "FAILED" || g.status === "BOUNCED")
              failed += g._count.status;
            else if (g.status === "PENDING") pending += g._count.status;
          }
          return { total: sent + failed + pending, sent, failed, pending };
        }),
    ]);

    const items: NewsletterSendLogItem[] = records.map((l) => ({
      id: l.id,
      newsletterId: l.newsletterId,
      subscriberId: l.subscriberId,
      email: l.email,
      name: l.name,
      status: l.status as any,
      error: l.error,
      sentAt: l.sentAt ? l.sentAt.toISOString() : null,
      createdAt: l.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      counts,
    };
  }
}
