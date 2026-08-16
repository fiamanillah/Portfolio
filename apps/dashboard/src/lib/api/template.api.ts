// apps/dashboard/src/lib/api/template.api.ts
import type {
  EmailTemplate,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  PreviewTemplateDTO,
  SendTestEmailDTO,
  TemplateStats,
  AdminTemplateQuery,
} from "@workspace/shared"
import { request } from "./client"

export const TemplateApi = {
  /**
   * 1. List email templates with pagination, search, source, syncStatus and type filters
   */
  async list(params?: AdminTemplateQuery) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.limit) searchParams.set("limit", String(params.limit))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.type && params.type !== "ALL")
      searchParams.set("type", params.type)
    if (params?.source && params.source !== "ALL")
      searchParams.set("source", params.source)
    if (params?.syncStatus && params.syncStatus !== "ALL")
      searchParams.set("syncStatus", params.syncStatus)
    if (params?.isSystem !== undefined)
      searchParams.set("isSystem", String(params.isSystem))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""
    return await request<EmailTemplate[]>(`/templates/v1${queryStr}`, {
      method: "GET",
    })
  },

  /**
   * 2. Get aggregated template metrics and KPI stats
   */
  async getStats() {
    return await request<TemplateStats>("/templates/v1/stats", {
      method: "GET",
    })
  },

  /**
   * 3. Get single template details by ID or Slug
   */
  async getById(idOrSlug: string) {
    return await request<EmailTemplate>(`/templates/v1/${idOrSlug}`, {
      method: "GET",
    })
  },

  /**
   * 4. Create new email template and optionally sync to Plunk
   */
  async create(payload: CreateTemplateDTO) {
    return await request<EmailTemplate>("/templates/v1", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 5. Update existing template
   */
  async update(id: string, payload: UpdateTemplateDTO) {
    return await request<EmailTemplate>(`/templates/v1/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 6. Reset a codebase system template back to default source code layout
   */
  async resetToDefault(idOrSlug: string) {
    return await request<EmailTemplate>(`/templates/v1/${idOrSlug}/reset`, {
      method: "POST",
    })
  },

  /**
   * 7. Synchronize single template to Plunk
   */
  async syncSingle(id: string) {
    return await request<EmailTemplate>(`/templates/v1/${id}/sync`, {
      method: "POST",
    })
  },

  /**
   * 8. Batch synchronize all templates to Plunk
   */
  async syncAll() {
    return await request<{
      total: number
      synced: number
      failed: number
      details: {
        id: string
        name: string
        plunkId?: string
        status: string
        error?: string
      }[]
    }>("/templates/v1/sync", {
      method: "POST",
    })
  },

  /**
   * 9. Duplicate template
   */
  async duplicate(id: string) {
    return await request<EmailTemplate>(`/templates/v1/${id}/duplicate`, {
      method: "POST",
    })
  },

  /**
   * 10. Delete template (custom templates only; codebase templates blocked by backend)
   */
  async delete(id: string, force: boolean = false) {
    const query = force ? "?force=true" : ""
    return await request<{ success: boolean; message: string }>(
      `/templates/v1/${id}${query}`,
      {
        method: "DELETE",
      }
    )
  },

  /**
   * 11. Render live Liquid template preview with context data
   */
  async preview(payload: PreviewTemplateDTO) {
    return await request<{
      subject: string
      body: string
      success: boolean
      error?: string
    }>("/templates/v1/preview", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async renderPreview(payload: PreviewTemplateDTO) {
    return this.preview(payload)
  },

  /**
   * 12. Send test email using template
   */
  async sendTestEmail(payload: SendTestEmailDTO) {
    return await request<{
      success: boolean
      to: string
      subject: string
      message: string
    }>("/templates/v1/send-test", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 13. Fetch remote templates directly from Plunk API
   */
  async getRemotePlunkTemplates() {
    return await request<any>("/templates/v1/remote", {
      method: "GET",
    })
  },
}
