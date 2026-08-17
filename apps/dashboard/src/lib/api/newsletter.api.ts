// apps/dashboard/src/lib/api/newsletter.api.ts
import type {
  NewsletterItem,
  NewsletterDetail,
  NewsletterStats,
  CreateNewsletterDTO,
  UpdateNewsletterDTO,
  ListNewslettersQueryDTO,
  CalculateRecipientsDTO,
  RecipientCalculationResult,
  SendTestNewsletterDTO,
  ScheduleNewsletterDTO,
  SpamCheckDTO,
  NewsletterSpamReport,
  ListNewsletterLogsQueryDTO,
  NewsletterSendLogItem,
} from "@workspace/shared";
import { request } from "./client";

export const NewsletterApi = {
  /**
   * 1. List campaigns with search, status/audience filters & pagination
   */
  async list(params?: Partial<ListNewslettersQueryDTO>) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status);
    if (params?.targetAudience && params.targetAudience !== "ALL")
      searchParams.set("targetAudience", params.targetAudience);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return await request<NewsletterItem[]>(`/newsletter/v1${queryStr}`, {
      method: "GET",
    });
  },

  /**
   * 2. Get KPI summary statistics
   */
  async getStats() {
    return await request<NewsletterStats>("/newsletter/v1/stats", {
      method: "GET",
    });
  },

  /**
   * 3. Get single campaign details by ID
   */
  async getById(id: string) {
    return await request<NewsletterDetail>(`/newsletter/v1/${id}`, {
      method: "GET",
    });
  },

  /**
   * 4. Create new campaign (draft or scheduled)
   */
  async create(payload: CreateNewsletterDTO) {
    return await request<NewsletterDetail>("/newsletter/v1", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Update existing campaign
   */
  async update(id: string, payload: UpdateNewsletterDTO) {
    return await request<NewsletterDetail>(`/newsletter/v1/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Delete campaign
   */
  async delete(id: string) {
    return await request<{ message: string }>(`/newsletter/v1/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 7. Duplicate campaign
   */
  async duplicate(id: string) {
    return await request<NewsletterDetail>(`/newsletter/v1/${id}/duplicate`, {
      method: "POST",
    });
  },

  /**
   * 8. Calculate recipients count dynamically with inclusion/exclusion filters
   */
  async calculateRecipients(payload: CalculateRecipientsDTO) {
    return await request<RecipientCalculationResult>(
      "/newsletter/v1/calculate-recipients",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 9. Anti-spam deliverability audit
   */
  async spamCheck(payload: SpamCheckDTO) {
    return await request<NewsletterSpamReport>("/newsletter/v1/spam-check", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 10. Send test newsletter to one or more emails
   */
  async sendTest(payload: SendTestNewsletterDTO) {
    return await request<{
      successful: number;
      failed: number;
      recipients: string[];
    }>("/newsletter/v1/send-test", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 11. Broadcast campaign immediately to all eligible recipients
   */
  async sendNow(id: string) {
    return await request<{
      success: boolean;
      message: string;
      newsletterId: string;
    }>(`/newsletter/v1/${id}/send`, {
      method: "POST",
    });
  },

  /**
   * 12. Schedule campaign for future dispatch
   */
  async schedule(id: string, payload: ScheduleNewsletterDTO) {
    return await request<NewsletterDetail>(`/newsletter/v1/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 13. Cancel a scheduled or sending campaign
   */
  async cancel(id: string) {
    return await request<NewsletterDetail>(`/newsletter/v1/${id}/cancel`, {
      method: "POST",
    });
  },

  /**
   * 14. Synchronize campaign status and delivery stats with Plunk
   */
  async sync(id: string) {
    return await request<NewsletterDetail>(`/newsletter/v1/${id}/sync`, {
      method: "POST",
    });
  },

  /**
   * 15. Get per-recipient delivery logs
   */
  async getLogs(id: string, params?: Partial<ListNewsletterLogsQueryDTO>) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return await request<NewsletterSendLogItem[]>(
      `/newsletter/v1/${id}/logs${queryStr}`,
      {
        method: "GET",
      }
    );
  },
};
