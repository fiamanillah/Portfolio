// apps/dashboard/src/lib/api/comment.api.ts
import type {
  CommentAdminListItemDTO,
  CommentModerationStatsDTO,
  CommentReportDTO,
  ListAdminCommentsQueryDTO,
  ListAdminReportsQueryDTO,
  UpdateCommentStatusDTO,
  ResolveCommentReportDTO,
  BulkCommentStatusDTO,
  BulkCommentDeleteDTO,
} from "@workspace/shared"
import { request } from "./client"

export const CommentApi = {
  /**
   * 1. Get comment moderation stats & overview KPIs
   */
  async getStats() {
    return await request<CommentModerationStatsDTO>(
      "/comments/v1/admin/stats",
      {
        method: "GET",
      }
    )
  },

  /**
   * 2. List all comments with admin filters, search, and pagination
   */
  async getComments(query: ListAdminCommentsQueryDTO = {}) {
    const params = new URLSearchParams()
    if (query.page) params.append("page", String(query.page))
    if (query.limit) params.append("limit", String(query.limit))
    if (query.search) params.append("search", query.search)
    if (query.status) params.append("status", query.status)
    if (query.postId) params.append("postId", query.postId)
    if (query.postSlug) params.append("postSlug", query.postSlug)
    if (query.reportedOnly !== undefined)
      params.append("reportedOnly", String(query.reportedOnly))
    if (query.sortBy) params.append("sortBy", query.sortBy)
    if (query.sortOrder) params.append("sortOrder", query.sortOrder)

    const queryString = params.toString() ? `?${params.toString()}` : ""
    return await request<CommentAdminListItemDTO[]>(
      `/comments/v1/admin/comments${queryString}`,
      {
        method: "GET",
      }
    )
  },

  /**
   * 3. Get single comment details by ID with parent, replies, and reports
   */
  async getById(id: string) {
    return await request<any>(`/comments/v1/admin/comments/${id}`, {
      method: "GET",
    })
  },

  /**
   * 4. Update comment status (APPROVE, SPAM, REJECT), pin status, or content
   */
  async updateStatus(id: string, payload: UpdateCommentStatusDTO) {
    return await request<any>(`/comments/v1/admin/comments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 5. Permanently delete a comment
   */
  async deleteComment(id: string) {
    return await request<{ success: boolean; id: string }>(
      `/comments/v1/admin/comments/${id}`,
      {
        method: "DELETE",
      }
    )
  },

  /**
   * 6. Bulk update status for multiple comments
   */
  async bulkUpdateStatus(payload: BulkCommentStatusDTO) {
    return await request<{ count: number }>(
      "/comments/v1/admin/comments/bulk-status",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  },

  /**
   * 7. Bulk delete multiple comments
   */
  async bulkDelete(payload: BulkCommentDeleteDTO) {
    return await request<{ count: number }>(
      "/comments/v1/admin/comments/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  },

  /**
   * 8. List flagged comment reports
   */
  async getReports(query: ListAdminReportsQueryDTO = {}) {
    const params = new URLSearchParams()
    if (query.page) params.append("page", String(query.page))
    if (query.limit) params.append("limit", String(query.limit))
    if (query.status) params.append("status", query.status)
    if (query.reason) params.append("reason", query.reason)
    if (query.commentId) params.append("commentId", query.commentId)
    if (query.search) params.append("search", query.search)
    if (query.sortBy) params.append("sortBy", query.sortBy)
    if (query.sortOrder) params.append("sortOrder", query.sortOrder)

    const queryString = params.toString() ? `?${params.toString()}` : ""
    return await request<CommentReportDTO[]>(
      `/comments/v1/admin/reports${queryString}`,
      {
        method: "GET",
      }
    )
  },

  /**
   * 9. Resolve a comment report with optional moderation action
   */
  async resolveReport(id: string, payload: ResolveCommentReportDTO) {
    return await request<any>(`/comments/v1/admin/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 10. Delete a report record
   */
  async deleteReport(id: string) {
    return await request<{ success: boolean; id: string }>(
      `/comments/v1/admin/reports/${id}`,
      {
        method: "DELETE",
      }
    )
  },
}
