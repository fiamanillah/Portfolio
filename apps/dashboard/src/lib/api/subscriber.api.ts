// apps/dashboard/src/lib/api/subscriber.api.ts
import type {
  SubscriberItem,
  SubscriberStats,
  AdminSubscriberQuery,
  AdminCreateSubscriberPayload,
  UpdateSubscriberPayload,
  AdminBulkUpdateStatusPayload,
  AdminBulkDeletePayload,
} from "@workspace/shared"
import { request } from "./client"

export const SubscriberApi = {
  /**
   * 1. List subscribers with pagination, search, status/source filters & sorting
   */
  async list(params?: AdminSubscriberQuery) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.limit) searchParams.set("limit", String(params.limit))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status)
    if (params?.source && params.source !== "ALL")
      searchParams.set("source", params.source)
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""
    return await request<SubscriberItem[], SubscriberStats>(
      `/subscriber/v1/list${queryStr}`,
      {
        method: "GET",
      }
    )
  },

  /**
   * 2. Get KPI summary statistics
   */
  async getStats() {
    return await request<SubscriberStats>("/subscriber/v1/admin/stats", {
      method: "GET",
    })
  },

  /**
   * 3. Admin manually create a subscriber
   */
  async create(payload: AdminCreateSubscriberPayload) {
    return await request<SubscriberItem>("/subscriber/v1/admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 4. Update subscriber by ID
   */
  async update(id: string, payload: UpdateSubscriberPayload) {
    return await request<SubscriberItem>(`/subscriber/v1/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 5. Delete subscriber by ID
   */
  async delete(id: string) {
    return await request<{ message: string }>(`/subscriber/v1/${id}`, {
      method: "DELETE",
    })
  },

  /**
   * 6. Bulk update status
   */
  async bulkUpdateStatus(payload: AdminBulkUpdateStatusPayload) {
    return await request<{ count: number }>(
      "/subscriber/v1/admin/bulk-status",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  },

  /**
   * 7. Bulk delete subscribers
   */
  async bulkDelete(payload: AdminBulkDeletePayload) {
    return await request<{ count: number }>(
      "/subscriber/v1/admin/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  },

  /**
   * 8. Resend confirmation / welcome email
   */
  async resendWelcome(id: string) {
    return await request<{ email: string; message: string }>(
      `/subscriber/v1/admin/${id}/resend`,
      {
        method: "POST",
      }
    )
  },

  /**
   * 9. Export all filtered subscribers
   */
  async export(params?: AdminSubscriberQuery) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status && params.status !== "ALL")
      searchParams.set("status", params.status)
    if (params?.source && params.source !== "ALL")
      searchParams.set("source", params.source)
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""
    return await request<SubscriberItem[]>(
      `/subscriber/v1/admin/export${queryStr}`,
      {
        method: "GET",
      }
    )
  },
}
