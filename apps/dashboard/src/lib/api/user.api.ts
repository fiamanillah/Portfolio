// apps/dashboard/src/lib/api/user.api.ts
import type { AuthUser, UpdateProfileInput, Role } from "@workspace/shared"
import { request } from "./client"

export const UserApi = {
  /**
   * 1. Get current admin profile
   */
  async getProfile() {
    return await request<AuthUser>("/users/v1/profile", {
      method: "GET",
    })
  },

  /**
   * 2. Update current admin profile
   */
  async updateProfile(payload: UpdateProfileInput) {
    return await request<AuthUser>("/users/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 3. Change password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    return await request<{ message: string }>("/users/v1/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  /**
   * 4. List all users for RBAC management (Admin only)
   */
  async listUsersAdmin(params?: {
    page?: number
    limit?: number
    search?: string
    role?: Role | string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.limit) searchParams.set("limit", String(params.limit))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role && params.role !== "ALL")
      searchParams.set("role", params.role)
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

    const queryStr = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""
    return await request<
      AuthUser[],
      {
        total: number
        admins: number
        moderators: number
        authors: number
        users: number
      }
    >(`/users/v1/admin/users${queryStr}`, {
      method: "GET",
    })
  },

  /**
   * 5. Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: Role | string) {
    return await request<AuthUser>(`/users/v1/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
  },

  /**
   * 6. Delete user account (Admin only)
   */
  async deleteUser(userId: string) {
    return await request<{ message: string }>(
      `/users/v1/admin/users/${userId}`,
      {
        method: "DELETE",
      }
    )
  },

  /**
   * 7. Upload profile avatar to Cloudflare R2 / S3
   */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return await request<AuthUser>("/users/v1/profile/avatar", {
      method: "POST",
      body: formData,
    })
  },

  /**
   * 8. Remove profile avatar
   */
  async deleteAvatar() {
    return await request<AuthUser>("/users/v1/profile/avatar", {
      method: "DELETE",
    })
  },

  /**
   * 9. Upload resume document to Cloudflare R2 / S3
   */
  async uploadResume(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return await request<AuthUser>("/users/v1/profile/resume", {
      method: "POST",
      body: formData,
    })
  },

  /**
   * 10. Remove resume document
   */
  async deleteResume() {
    return await request<AuthUser>("/users/v1/profile/resume", {
      method: "DELETE",
    })
  },

  /**
   * 11. Get public resume metadata
   */
  async getPublicResume() {
    return await request<{
      resumeUrl: string | null
      name: string | null
      updatedAt: string | null
    }>("/users/v1/public/resume", {
      method: "GET",
    })
  },
}
