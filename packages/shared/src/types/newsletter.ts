// packages/shared/src/types/newsletter.ts
import { z } from "zod";
import {
  newsletterStatusEnumSchema,
  audienceTypeEnumSchema,
  sendLogStatusEnumSchema,
  createNewsletterSchema,
  updateNewsletterSchema,
  listNewslettersQuerySchema,
  calculateRecipientsSchema,
  sendTestNewsletterSchema,
  scheduleNewsletterSchema,
  spamCheckSchema,
  listNewsletterLogsQuerySchema,
} from "../schemas/newsletter.schema";

export type NewsletterStatus = z.infer<typeof newsletterStatusEnumSchema>;
export type AudienceType = z.infer<typeof audienceTypeEnumSchema>;
export type SendLogStatus = z.infer<typeof sendLogStatusEnumSchema>;

export type CreateNewsletterDTO = z.infer<typeof createNewsletterSchema>;
export type UpdateNewsletterDTO = z.infer<typeof updateNewsletterSchema>;
export type ListNewslettersQueryDTO = z.infer<typeof listNewslettersQuerySchema>;
export type CalculateRecipientsDTO = z.infer<typeof calculateRecipientsSchema>;
export type SendTestNewsletterDTO = z.infer<typeof sendTestNewsletterSchema>;
export type ScheduleNewsletterDTO = z.infer<typeof scheduleNewsletterSchema>;
export type SpamCheckDTO = z.infer<typeof spamCheckSchema>;
export type ListNewsletterLogsQueryDTO = z.infer<typeof listNewsletterLogsQuerySchema>;

export interface SpamRuleCheck {
  id: string;
  name: string;
  category: "subject" | "content" | "compliance" | "links";
  passed: boolean;
  scorePenalty: number;
  message: string;
  recommendation?: string;
  highlightedTerms?: string[];
}

export interface NewsletterSpamReport {
  score: number; // 0 (spam) to 100 (excellent deliverability)
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  checks: SpamRuleCheck[];
  summary: string;
  recommendations: string[];
}

export interface NewsletterItem {
  id: string;
  title: string;
  subject: string;
  previewText?: string | null;
  status: NewsletterStatus;
  templateId?: string | null;
  plunkCampaignId?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
  targetAudience: AudienceType;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  bouncedCount?: number;
  spamScore?: number | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterDetail extends NewsletterItem {
  content: string;
  replyTo?: string | null;
  includedSources: string[];
  includedTags: string[];
  includedEmails: string[];
  excludedEmails: string[];
  excludedSources: string[];
  spamReport?: NewsletterSpamReport | null;
  metadata?: Record<string, unknown> | null;
}

export interface NewsletterSendLogItem {
  id: string;
  newsletterId: string;
  subscriberId?: string | null;
  email: string;
  name?: string | null;
  status: SendLogStatus;
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface NewsletterStats {
  totalCampaigns: number;
  draftsCount: number;
  scheduledCount: number;
  sendingCount: number;
  sentCount: number;
  totalEmailsSent: number;
  totalEmailsFailed: number;
  averageDeliveryRate: number;
  recentCampaigns7d: number;
}

export interface RecipientCalculationResult {
  totalCount: number;
  totalSubscribers: number;
  includedCustomCount: number;
  excludedCount: number;
  previewRecipients: {
    email: string;
    name?: string | null;
    source?: string | null;
    reason: "active_subscriber" | "custom_include";
  }[];
}
