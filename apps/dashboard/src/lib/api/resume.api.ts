// apps/dashboard/src/lib/api/resume.api.ts
import type {
  ResumeDTO,
  ResumeStatsDTO,
  UpdateResumeInput,
} from "@workspace/shared"
import { request, ApiResponse } from "./client"

export const ResumeApi = {
  /**
   * 1. Get current active resume
   */
  async getActive() {
    return await request<ResumeDTO | null>("/resume/v1/public/active", {
      method: "GET",
    })
  },

  /**
   * 2. List all resume versions (Admin)
   */
  async list(params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean | string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<ApiResponse<ResumeDTO[], ResumeStatsDTO>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.limit) searchParams.set("limit", String(params.limit))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined && params.isActive !== "all") {
      searchParams.set("isActive", String(params.isActive))
    }
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""
    return await request<ResumeDTO[], ResumeStatsDTO>(
      `/resume/v1/admin${queryStr}`,
      {
        method: "GET",
      }
    )
  },

  /**
   * 3. Get single resume version by ID
   */
  async getById(id: string) {
    return await request<ResumeDTO>(`/resume/v1/admin/${id}`, {
      method: "GET",
    })
  },

  /**
   * 4. Upload & create new resume version
   */
  async uploadVersion(formData: FormData) {
    return await request<ResumeDTO>("/resume/v1/admin", {
      method: "POST",
      body: formData,
    })
  },

  /**
   * 5. Update resume version metadata
   */
  async update(id: string, payload: UpdateResumeInput) {
    return await request<ResumeDTO>(`/resume/v1/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 6. Set specific version as active
   */
  async setActive(id: string) {
    return await request<ResumeDTO>(`/resume/v1/admin/${id}/activate`, {
      method: "PATCH",
    })
  },

  /**
   * 7. Delete resume version
   */
  async delete(id: string) {
    return await request<{ message: string }>(`/resume/v1/admin/${id}`, {
      method: "DELETE",
    })
  },
}
