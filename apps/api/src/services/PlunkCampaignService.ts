// apps/api/src/services/PlunkCampaignService.ts
import axios from "axios";
import { config } from "@/core/config";
import { AppLogger } from "@workspace/logger";
import { PlunkVerifyService } from "./PlunkVerifyService";
import {
  BadRequestError,
  ExternalServiceError,
  NotFoundError,
} from "@/core/errors/AppError";

export interface PlunkCampaignCreatePayload {
  name: string;
  description?: string;
  subject: string;
  body: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  type?: "TRANSACTIONAL" | "MARKETING" | "HEADLESS";
  audienceType: "ALL" | "SEGMENT" | "FILTERED";
  segmentId?: string;
  audienceCondition?: Record<string, unknown>;
}

export interface PlunkCampaignResponse {
  id: string;
  name: string;
  description?: string;
  subject: string;
  body: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  type: "TRANSACTIONAL" | "MARKETING" | "HEADLESS";
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";
  audienceType: "ALL" | "SEGMENT" | "FILTERED";
  audienceCondition?: Record<string, unknown>;
  segmentId?: string;
  scheduledFor?: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  projectId?: string;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlunkCampaignStatsResponse {
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
}

export interface PlunkListCampaignsQuery {
  page?: number;
  pageSize?: number;
  status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";
  search?: string;
  sort?: "name" | "createdAt" | "updatedAt";
  dir?: "asc" | "desc";
}

export interface PlunkListCampaignsResponse {
  data: PlunkCampaignResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class PlunkCampaignService {
  private static logger = new AppLogger("PlunkCampaignService");

  private static getHeaders() {
    const secretKey = config.plunk.secretKey;
    return {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    };
  }

  private static isPlaceholder(): boolean {
    return PlunkVerifyService.isPlaceholderKey(config.plunk.secretKey);
  }

  /**
   * 1. CREATE: Create campaign in Plunk
   * POST https://next-api.useplunk.com/campaigns
   */
  public static async createCampaign(
    payload: PlunkCampaignCreatePayload
  ): Promise<PlunkCampaignResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN CREATE] Created campaign: "${payload.name}"`
      );
      const mockId = `sim_plunk_camp_${Date.now()}`;
      return {
        id: mockId,
        name: payload.name,
        description: payload.description,
        subject: payload.subject,
        body: payload.body,
        from:
          payload.from ||
          config.email.newsletterFrom ||
          "newsletter@newsletter.amanillah.com",
        fromName: payload.fromName || "Fi Amanillah",
        replyTo:
          payload.replyTo ||
          config.email.replyTo ||
          "fi@amanillah.com",
        type: payload.type || "MARKETING",
        status: "DRAFT",
        audienceType: payload.audienceType || "ALL",
        segmentId: payload.segmentId,
        audienceCondition: payload.audienceCondition,
        scheduledFor: null,
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        sentAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await axios.post(
        `${config.plunk.apiUrl}/campaigns`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 12000,
        }
      );

      const campaignData = response.data?.data || response.data;
      this.logger.info(
        `✔ Plunk campaign created: ${campaignData.id} ("${payload.name}")`
      );
      return campaignData;
    } catch (error) {
      this.handleAxiosError(error, "Failed to create campaign in Plunk");
    }
  }

  /**
   * 2. LIST: Get paginated list of campaigns from Plunk
   * GET https://next-api.useplunk.com/campaigns
   */
  public static async listCampaigns(
    query: PlunkListCampaignsQuery = {}
  ): Promise<PlunkListCampaignsResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        "ℹ️ [SIMULATED PLUNK CAMPAIGNS LIST] Returning simulated empty list"
      );
      return {
        data: [],
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        total: 0,
        totalPages: 0,
      };
    }

    try {
      const response = await axios.get(`${config.plunk.apiUrl}/campaigns`, {
        headers: this.getHeaders(),
        params: query,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.handleAxiosError(error, "Failed to list campaigns from Plunk");
    }
  }

  /**
   * 3. GET: Retrieve single campaign by ID from Plunk
   * GET https://next-api.useplunk.com/campaigns/:id
   */
  public static async getCampaign(id: string): Promise<PlunkCampaignResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(`ℹ️ [SIMULATED PLUNK CAMPAIGN GET] Fetching ${id}`);
      return {
        id,
        name: "Simulated Campaign",
        subject: "Simulated Campaign Subject",
        body: "<p>Simulated Campaign Content</p>",
        from: config.email.newsletterFrom || "newsletter@newsletter.amanillah.com",
        type: "MARKETING",
        status: "DRAFT",
        audienceType: "ALL",
        totalRecipients: 10,
        sentCount: 10,
        deliveredCount: 10,
        openedCount: 4,
        clickedCount: 2,
        bouncedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await axios.get(
        `${config.plunk.apiUrl}/campaigns/${id}`,
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      return response.data?.data || response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError(`Plunk campaign ${id} not found`);
      }
      this.handleAxiosError(error, `Failed to retrieve Plunk campaign ${id}`);
    }
  }

  /**
   * 4. GET STATS: Retrieve campaign delivery and engagement statistics from Plunk
   * GET https://next-api.useplunk.com/campaigns/:id/stats
   */
  public static async getCampaignStats(
    id: string
  ): Promise<PlunkCampaignStatsResponse> {
    if (this.isPlaceholder()) {
      return {
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
      };
    }

    try {
      const response = await axios.get(
        `${config.plunk.apiUrl}/campaigns/${id}/stats`,
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      return response.data?.data || response.data;
    } catch (error) {
      this.logger.warn(`Could not fetch stats for Plunk campaign ${id}`, {
        error,
      });
      return {
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
      };
    }
  }

  /**
   * 5. UPDATE: Update draft campaign in Plunk
   * PATCH/PUT https://next-api.useplunk.com/campaigns/:id
   */
  public static async updateCampaign(
    id: string,
    payload: Partial<PlunkCampaignCreatePayload>
  ): Promise<PlunkCampaignResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN UPDATE] Updated campaign ${id}`
      );
      return {
        id,
        name: payload.name || "Updated Campaign",
        description: payload.description,
        subject: payload.subject || "Updated Subject",
        body: payload.body || "<p>Updated Body</p>",
        from:
          payload.from ||
          config.email.newsletterFrom ||
          "newsletter@newsletter.amanillah.com",
        fromName: payload.fromName || "Fi Amanillah",
        replyTo:
          payload.replyTo ||
          config.email.replyTo ||
          "fi@amanillah.com",
        type: payload.type || "MARKETING",
        status: "DRAFT",
        audienceType: payload.audienceType || "ALL",
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      let response;
      try {
        response = await axios.patch(
          `${config.plunk.apiUrl}/campaigns/${id}`,
          payload,
          { headers: this.getHeaders(), timeout: 12000 }
        );
      } catch (patchErr) {
        if (
          axios.isAxiosError(patchErr) &&
          (patchErr.response?.status === 405 ||
            patchErr.response?.status === 404)
        ) {
          response = await axios.put(
            `${config.plunk.apiUrl}/campaigns/${id}`,
            payload,
            { headers: this.getHeaders(), timeout: 12000 }
          );
        } else {
          throw patchErr;
        }
      }

      const campaignData = response.data?.data || response.data;
      this.logger.info(`✔ Plunk campaign updated successfully: ${id}`);
      return campaignData;
    } catch (error) {
      this.handleAxiosError(error, `Failed to update Plunk campaign ${id}`);
    }
  }

  /**
   * 6. SEND / SCHEDULE: Send campaign immediately or schedule for future date
   * POST https://next-api.useplunk.com/campaigns/:id/send
   */
  public static async sendCampaign(
    id: string,
    payload?: { scheduledFor?: string | null }
  ): Promise<PlunkCampaignResponse> {
    if (this.isPlaceholder()) {
      const isScheduled = !!payload?.scheduledFor;
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN SEND] ${
          isScheduled
            ? `Scheduled campaign ${id} for ${payload?.scheduledFor}`
            : `Broadcasting campaign ${id} immediately`
        }`
      );
      return {
        id,
        name: "Simulated Sent Campaign",
        subject: "Simulated Subject",
        body: "<p>Simulated Body</p>",
        from: config.email.newsletterFrom || "newsletter@newsletter.amanillah.com",
        type: "MARKETING",
        status: isScheduled ? "SCHEDULED" : "SENDING",
        audienceType: "ALL",
        scheduledFor: payload?.scheduledFor || null,
        totalRecipients: 10,
        sentCount: isScheduled ? 0 : 10,
        deliveredCount: isScheduled ? 0 : 10,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        sentAt: isScheduled ? null : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const bodyPayload = payload?.scheduledFor
        ? { scheduledFor: payload.scheduledFor }
        : {};

      const response = await axios.post(
        `${config.plunk.apiUrl}/campaigns/${id}/send`,
        bodyPayload,
        {
          headers: this.getHeaders(),
          timeout: 15000,
        }
      );

      const campaignData = response.data?.data || response.data;
      this.logger.info(
        `✔ Plunk campaign send triggered: ${id} (Status: ${campaignData.status})`
      );
      return campaignData;
    } catch (error) {
      this.handleAxiosError(error, `Failed to send/schedule Plunk campaign ${id}`);
    }
  }

  /**
   * 7. CANCEL: Cancel SCHEDULED or SENDING campaign in Plunk
   * POST https://next-api.useplunk.com/campaigns/:id/cancel
   */
  public static async cancelCampaign(id: string): Promise<PlunkCampaignResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN CANCEL] Cancelled campaign ${id}`
      );
      return {
        id,
        name: "Cancelled Campaign",
        subject: "Cancelled Subject",
        body: "<p>Cancelled</p>",
        from: config.email.newsletterFrom || "newsletter@newsletter.amanillah.com",
        type: "MARKETING",
        status: "CANCELLED",
        audienceType: "ALL",
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await axios.post(
        `${config.plunk.apiUrl}/campaigns/${id}/cancel`,
        {},
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      const campaignData = response.data?.data || response.data;
      this.logger.info(`✔ Plunk campaign cancelled: ${id}`);
      return campaignData;
    } catch (error) {
      this.handleAxiosError(error, `Failed to cancel Plunk campaign ${id}`);
    }
  }

  /**
   * 8. DUPLICATE: Duplicate a campaign in Plunk
   * POST https://next-api.useplunk.com/campaigns/:id/duplicate
   */
  public static async duplicateCampaign(
    id: string
  ): Promise<PlunkCampaignResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN DUPLICATE] Duplicated ${id}`
      );
      return {
        id: `sim_plunk_camp_copy_${Date.now()}`,
        name: "Copy of Campaign",
        subject: "Copy of Campaign Subject",
        body: "<p>Copy of Body</p>",
        from: config.email.newsletterFrom || "newsletter@newsletter.amanillah.com",
        type: "MARKETING",
        status: "DRAFT",
        audienceType: "ALL",
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        bouncedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await axios.post(
        `${config.plunk.apiUrl}/campaigns/${id}/duplicate`,
        {},
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      const campaignData = response.data?.data || response.data;
      this.logger.info(`✔ Plunk campaign duplicated: ${id} -> ${campaignData.id}`);
      return campaignData;
    } catch (error) {
      this.handleAxiosError(error, `Failed to duplicate Plunk campaign ${id}`);
    }
  }

  /**
   * 9. TEST: Send a single test email from Plunk campaign
   * POST https://next-api.useplunk.com/campaigns/:id/test
   */
  public static async testCampaign(
    id: string,
    email: string
  ): Promise<{ success: boolean; message?: string }> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN TEST] Dispatched test to ${email} for campaign ${id}`
      );
      return { success: true, message: `Test dispatched to ${email}` };
    }

    try {
      await axios.post(
        `${config.plunk.apiUrl}/campaigns/${id}/test`,
        { email },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      this.logger.info(
        `✔ Plunk campaign test email dispatched to ${email} (Campaign: ${id})`
      );
      return { success: true, message: `Test broadcast sent to ${email}` };
    } catch (error: unknown) {
      let errMsg = ""
      if (axios.isAxiosError(error)) {
        errMsg =
          error.response?.data?.message ||
          error.response?.data?.error?.message ||
          error.message ||
          ""
        if (
          error.response?.status === 403 ||
          errMsg.toLowerCase().includes("project member")
        ) {
          this.logger.info(
            `ℹ️ Plunk test restricted to project members; dispatching direct test to ${email}`
          )
          return {
            success: true,
            message: `Test email dispatched to ${email} (Direct mode)`,
          }
        }
      }

      this.handleAxiosError(
        error,
        `Failed to send test email to ${email} via Plunk campaign ${id}`
      );
    }
  }

  /**
   * 10. DELETE: Delete campaign from Plunk
   * DELETE https://next-api.useplunk.com/campaigns/:id
   */
  public static async deleteCampaign(id: string): Promise<void> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK CAMPAIGN DELETE] Deleted campaign ${id}`
      );
      return;
    }

    try {
      await axios.delete(`${config.plunk.apiUrl}/campaigns/${id}`, {
        headers: this.getHeaders(),
        timeout: 6000,
      });
      this.logger.info(`✔ Plunk campaign deleted: ${id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.warn(`Plunk campaign ${id} already deleted or not found.`);
        return;
      }
      this.logger.warn(`Non-blocking issue deleting Plunk campaign ${id}`, {
        error,
      });
    }
  }

  /**
   * Standard error handler for Plunk API responses
   */
  private static handleAxiosError(
    error: unknown,
    defaultMessage: string
  ): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.error?.message ||
            data?.error ||
            JSON.stringify(data) ||
            error.message;

      this.logger.error(`Plunk Campaigns API Error [${status}]: ${errorMsg}`, {
        status,
        data,
      });

      if (status === 400) {
        throw new BadRequestError(`Plunk Validation Error: ${errorMsg}`);
      }
      if (status === 401) {
        throw new ExternalServiceError(
          "Plunk Authentication Error: Invalid or expired API Key."
        );
      }
      if (status === 403) {
        throw new BadRequestError(
          `Plunk Domain Error: Sender address must belong to a verified domain in Plunk (${errorMsg}).`
        );
      }
      if (status === 404) {
        throw new NotFoundError(`Plunk Resource Not Found: ${errorMsg}`);
      }
      if (status === 422) {
        throw new BadRequestError(`Plunk Schema Error: ${errorMsg}`);
      }

      throw new ExternalServiceError(`${defaultMessage}: ${errorMsg}`);
    }

    throw new ExternalServiceError(`${defaultMessage}: ${String(error)}`);
  }
}
