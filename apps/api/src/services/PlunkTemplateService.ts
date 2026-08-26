// src/services/PlunkTemplateService.ts
import axios from "axios"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"
import { PlunkVerifyService } from "./PlunkVerifyService"
import {
  BadRequestError,
  ExternalServiceError,
  NotFoundError,
} from "@/core/errors/AppError"

export interface PlunkTemplatePayload {
  name: string
  description?: string
  subject: string
  body: string
  from?: string
  fromName?: string
  replyTo?: string
  type?: "TRANSACTIONAL" | "MARKETING" | "HEADLESS"
}

export interface PlunkTemplateResponse {
  id: string
  name: string
  description?: string
  subject: string
  body: string
  from: string
  fromName?: string
  replyTo?: string
  type: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface PlunkListTemplatesQuery {
  page?: number
  pageSize?: number
  type?: "TRANSACTIONAL" | "MARKETING" | "HEADLESS"
  search?: string
  sort?: "name" | "createdAt" | "updatedAt"
  dir?: "asc" | "desc"
}

export interface PlunkListTemplatesResponse {
  data: PlunkTemplateResponse[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class PlunkTemplateService {
  private static logger = new AppLogger("PlunkTemplateService")

  private static getHeaders() {
    const secretKey = config.plunk.secretKey
    return {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    }
  }

  private static isPlaceholder(): boolean {
    return (
      process.env.NODE_ENV === "test" ||
      process.env.BUN_ENV === "test" ||
      process.env.DISABLE_EMAIL_DELIVERY === "true" ||
      process.env.MOCK_EMAILS === "true" ||
      PlunkVerifyService.isPlaceholderKey(config.plunk.secretKey)
    )
  }

  /**
   * CREATE: Create a new template in Plunk
   * POST https://next-api.useplunk.com/templates
   */
  public static async createTemplate(
    payload: PlunkTemplatePayload
  ): Promise<PlunkTemplateResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK TEMPLATE CREATE] Created template: "${payload.name}"`
      )
      const mockId = `sim_plunk_${Date.now()}`
      return {
        id: mockId,
        name: payload.name,
        description: payload.description,
        subject: payload.subject,
        body: payload.body,
        from:
          payload.from ||
          config.email.transactionalFrom ||
          "hello@mail.amanillah.com",
        fromName: payload.fromName || "Fi Amanillah",
        replyTo: payload.replyTo || config.email.replyTo || "fi@amanillah.com",
        type: payload.type || "MARKETING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    try {
      const response = await axios.post(
        `${config.plunk.apiUrl}/templates`,
        {
          name: payload.name,
          description: payload.description,
          subject: payload.subject,
          body: payload.body,
          from: payload.from || config.contact.recipientEmail,
          fromName: payload.fromName,
          replyTo: payload.replyTo,
          type: payload.type || "MARKETING",
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      )

      this.logger.info(
        `✔ Plunk template created successfully: ${response.data.id} (${payload.name})`
      )
      return response.data
    } catch (error) {
      this.handleAxiosError(error, "Failed to create template in Plunk")
    }
  }

  /**
   * LIST: Get paginated list of templates from Plunk
   * GET https://next-api.useplunk.com/templates
   */
  public static async listTemplates(
    query: PlunkListTemplatesQuery = {}
  ): Promise<PlunkListTemplatesResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        "ℹ️ [SIMULATED PLUNK TEMPLATES LIST] Returning empty/simulated list"
      )
      return {
        data: [],
        total: 0,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        totalPages: 0,
      }
    }

    try {
      const response = await axios.get(`${config.plunk.apiUrl}/templates`, {
        headers: this.getHeaders(),
        params: query,
        timeout: 10000,
      })

      return response.data
    } catch (error) {
      this.handleAxiosError(error, "Failed to list templates from Plunk")
    }
  }

  /**
   * GET: Retrieve single template by ID from Plunk
   * GET https://next-api.useplunk.com/templates/:id
   */
  public static async getTemplate(id: string): Promise<PlunkTemplateResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(`ℹ️ [SIMULATED PLUNK TEMPLATE GET] Fetching ${id}`)
      return {
        id,
        name: "Simulated Template",
        subject: "Simulated Subject",
        body: "<p>Simulated body</p>",
        from: config.contact.recipientEmail,
        type: "TRANSACTIONAL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    try {
      const response = await axios.get(
        `${config.plunk.apiUrl}/templates/${id}`,
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError(`Plunk template ${id} not found`)
      }
      this.handleAxiosError(error, `Failed to retrieve Plunk template ${id}`)
    }
  }

  /**
   * UPDATE: Update template in Plunk
   * PUT or PATCH https://next-api.useplunk.com/templates/:id
   */
  public static async updateTemplate(
    id: string,
    payload: Partial<PlunkTemplatePayload>
  ): Promise<PlunkTemplateResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK TEMPLATE UPDATE] Updated template ${id}`
      )
      return {
        id,
        name: payload.name || "Updated Template",
        description: payload.description,
        subject: payload.subject || "Updated Subject",
        body: payload.body || "<p>Updated Body</p>",
        from: payload.from || config.contact.recipientEmail,
        fromName: payload.fromName,
        replyTo: payload.replyTo,
        type: payload.type || "MARKETING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    try {
      // Try PATCH first, fall back to PUT if necessary
      let response
      try {
        response = await axios.patch(
          `${config.plunk.apiUrl}/templates/${id}`,
          payload,
          { headers: this.getHeaders(), timeout: 10000 }
        )
      } catch (patchErr) {
        if (
          axios.isAxiosError(patchErr) &&
          (patchErr.response?.status === 405 ||
            patchErr.response?.status === 404)
        ) {
          response = await axios.put(
            `${config.plunk.apiUrl}/templates/${id}`,
            payload,
            { headers: this.getHeaders(), timeout: 10000 }
          )
        } else {
          throw patchErr
        }
      }

      this.logger.info(`✔ Plunk template updated successfully: ${id}`)
      return response.data
    } catch (error) {
      this.handleAxiosError(error, `Failed to update Plunk template ${id}`)
    }
  }

  /**
   * DELETE: Delete template from Plunk
   * DELETE https://next-api.useplunk.com/templates/:id
   */
  public static async deleteTemplate(id: string): Promise<void> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK TEMPLATE DELETE] Deleted template ${id}`
      )
      return
    }

    try {
      await axios.delete(`${config.plunk.apiUrl}/templates/${id}`, {
        headers: this.getHeaders(),
        timeout: 4000,
      })
      this.logger.info(`✔ Plunk template deleted successfully: ${id}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.warn(`Plunk template ${id} already deleted or not found.`)
        return
      }
      this.logger.warn(`Non-blocking issue deleting Plunk template ${id}`, {
        error,
      })
    }
  }

  /**
   * DUPLICATE: Duplicate a template in Plunk
   * POST https://next-api.useplunk.com/templates/:id/duplicate
   */
  public static async duplicateTemplate(
    id: string
  ): Promise<PlunkTemplateResponse> {
    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK TEMPLATE DUPLICATE] Duplicated ${id}`
      )
      return {
        id: `sim_plunk_copy_${Date.now()}`,
        name: "Copy of Template",
        subject: "Copy of Subject",
        body: "<p>Copy of Body</p>",
        from: config.contact.recipientEmail,
        type: "TRANSACTIONAL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    try {
      const response = await axios.post(
        `${config.plunk.apiUrl}/templates/${id}/duplicate`,
        {},
        { headers: this.getHeaders(), timeout: 10000 }
      )
      this.logger.info(
        `✔ Plunk template duplicated: ${id} -> ${response.data.id}`
      )
      return response.data
    } catch (error) {
      this.handleAxiosError(error, `Failed to duplicate Plunk template ${id}`)
    }
  }

  /**
   * SEND: Dispatch email using Plunk /v1/send with template and liquid variables
   */
  public static async sendWithTemplate(options: {
    to: string
    templateId?: string
    subject?: string
    body?: string
    data?: Record<string, unknown>
    reply?: string
    from?: string
    fromName?: string
    headers?: Record<string, string>
  }): Promise<void> {
    const {
      to,
      templateId,
      subject,
      body,
      data,
      reply,
      from,
      fromName,
      headers,
    } = options

    if (this.isPlaceholder()) {
      this.logger.info(
        `ℹ️ [SIMULATED PLUNK SEND] Sent email to: ${to} (Template: ${templateId || "None"})`
      )
      return
    }

    try {
      const senderFrom =
        from || config.email.transactionalFrom || "hello@mail.amanillah.com"
      const senderName = fromName || "Fi Amanillah"
      const replyToAddress = reply || config.email.replyTo || "fi@amanillah.com"

      const payload: Record<string, unknown> = {
        to,
        from: senderFrom,
        name: senderName,
        ...(fromName ? { fromName } : {}),
        ...(subject ? { subject } : {}),
        ...(body ? { body } : {}),
        ...(data ? { data } : {}),
        reply: replyToAddress,
        ...(headers ? { headers } : {}),
      }

      if (templateId) {
        payload.template = templateId
      }

      await axios.post(`${config.plunk.apiUrl}/v1/send`, payload, {
        headers: this.getHeaders(),
        timeout: 10000,
      })

      this.logger.info(
        `✔ Email dispatched to ${to} via Plunk (Template: ${templateId || "Direct Body"})`
      )
    } catch (error) {
      this.handleAxiosError(
        error,
        `Failed to dispatch email to ${to} via Plunk`
      )
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
      const status = error.response?.status
      const data = error.response?.data
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.error ||
            JSON.stringify(data) ||
            error.message

      this.logger.error(`Plunk API Error [${status}]: ${errorMsg}`, {
        status,
        data,
      })

      if (status === 400) {
        throw new BadRequestError(`Plunk Validation Error: ${errorMsg}`)
      }
      if (status === 401) {
        throw new ExternalServiceError(
          "Plunk Authentication Error: Invalid or expired API Key."
        )
      }
      if (status === 403) {
        throw new BadRequestError(
          `Plunk Domain Error: Sender address must belong to a verified domain (${errorMsg}).`
        )
      }
      if (status === 404) {
        throw new NotFoundError(`Plunk Resource Not Found: ${errorMsg}`)
      }

      throw new ExternalServiceError(`${defaultMessage}: ${errorMsg}`)
    }

    throw new ExternalServiceError(`${defaultMessage}: ${String(error)}`)
  }
}
