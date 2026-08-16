// apps/dashboard/src/lib/api.ts
import type {
  AuthUser,
  LoginInput,
  UpdateProfileInput,
  Role,
  SubscriberItem,
  SubscriberStats,
  AdminSubscriberQuery,
  AdminCreateSubscriberPayload,
  UpdateSubscriberPayload,
  AdminBulkUpdateStatusPayload,
  AdminBulkDeletePayload,
  EmailTemplate,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  PreviewTemplateDTO,
  SendTestEmailDTO,
  TemplateStats,
  AdminTemplateQuery,
} from "@workspace/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export const ACCESS_TOKEN_KEY = "portfolio_access_token";
export const AUTH_COOKIE_NAME = "auth_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      // Set cookie for Next.js server middleware access
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
        token
      )}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch (e) {
    console.error("Failed to manage access token in storage/cookies:", e);
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
    totalPages?: number;
  };
  stats?: SubscriberStats | any;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        body?.message ||
        body?.error?.message ||
        `Request failed with status ${res.status}`;
      return { success: false, error: errMsg, message: errMsg };
    }

    return {
      success: true,
      data: (body?.data !== undefined ? body.data : body) as T,
      message: body?.message,
      pagination: body?.pagination,
      stats: body?.stats,
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message || "Network error. Please ensure the backend API is running.",
    };
  }
}

export const AuthApi = {
  /**
   * 1. Admin Sign In
   */
  async login(payload: LoginInput) {
    const res = await request<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/v1/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken);
    }

    return res;
  },

  /**
   * 2. 1-Click Demo Login
   */
  async demoLogin(userId: string) {
    const res = await request<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/v1/demo-login", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken);
    }

    return res;
  },

  /**
   * 3. Get current authenticated user profile & role
   */
  async getMe() {
    return await request<AuthUser>("/auth/v1/me", {
      method: "GET",
    });
  },

  /**
   * 4. Sign Out
   */
  async logout() {
    try {
      await request("/auth/v1/logout", {
        method: "POST",
      });
    } catch {
      // ignore
    } finally {
      setStoredAccessToken(null);
    }
  },
};

export const UserApi = {
  /**
   * 1. Get current admin profile
   */
  async getProfile() {
    return await request<AuthUser>("/users/v1/profile", {
      method: "GET",
    });
  },

  /**
   * 2. Update current admin profile
   */
  async updateProfile(payload: UpdateProfileInput) {
    return await request<AuthUser>("/users/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 3. Change password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    return await request<{ message: string }>("/users/v1/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * 4. List all users for RBAC management (Admin only)
   */
  async listUsersAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role | string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role && params.role !== "ALL") searchParams.set("role", params.role);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await request<AuthUser[]>(`/users/v1/admin/users${queryStr}`, {
      method: "GET",
    });
  },

  /**
   * 5. Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: Role | string) {
    return await request<AuthUser>(`/users/v1/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  /**
   * 6. Delete user account (Admin only)
   */
  async deleteUser(userId: string) {
    return await request<{ message: string }>(`/users/v1/admin/users/${userId}`, {
      method: "DELETE",
    });
  },
};

export const SubscriberApi = {
  /**
   * 1. List subscribers with pagination, search, status/source filters & sorting
   */
  async list(params?: AdminSubscriberQuery) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
    if (params?.source && params.source !== "ALL") searchParams.set("source", params.source);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await request<SubscriberItem[]>(`/subscriber/v1/list${queryStr}`, {
      method: "GET",
    });
  },

  /**
   * 2. Get KPI summary statistics
   */
  async getStats() {
    return await request<SubscriberStats>("/subscriber/v1/admin/stats", {
      method: "GET",
    });
  },

  /**
   * 3. Admin manually create a subscriber
   */
  async create(payload: AdminCreateSubscriberPayload) {
    return await request<SubscriberItem>("/subscriber/v1/admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 4. Update subscriber by ID
   */
  async update(id: string, payload: UpdateSubscriberPayload) {
    return await request<SubscriberItem>(`/subscriber/v1/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Delete subscriber by ID
   */
  async delete(id: string) {
    return await request<{ message: string }>(`/subscriber/v1/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 6. Bulk update status
   */
  async bulkUpdateStatus(payload: AdminBulkUpdateStatusPayload) {
    return await request<{ count: number }>("/subscriber/v1/admin/bulk-status", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 7. Bulk delete subscribers
   */
  async bulkDelete(payload: AdminBulkDeletePayload) {
    return await request<{ count: number }>("/subscriber/v1/admin/bulk-delete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 8. Resend confirmation / welcome email
   */
  async resendWelcome(id: string) {
    return await request<{ email: string; message: string }>(`/subscriber/v1/admin/${id}/resend`, {
      method: "POST",
    });
  },

  /**
   * 9. Export all filtered subscribers
   */
  async export(params?: AdminSubscriberQuery) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
    if (params?.source && params.source !== "ALL") searchParams.set("source", params.source);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await request<SubscriberItem[]>(`/subscriber/v1/admin/export${queryStr}`, {
      method: "GET",
    });
  },
};

export const TemplateApi = {
  /**
   * 1. List email templates with pagination, search, source, syncStatus and type filters
   */
  async list(params?: AdminTemplateQuery) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type && params.type !== "ALL") searchParams.set("type", params.type);
    if (params?.source && params.source !== "ALL") searchParams.set("source", params.source);
    if (params?.syncStatus && params.syncStatus !== "ALL") searchParams.set("syncStatus", params.syncStatus);
    if (params?.isSystem !== undefined) searchParams.set("isSystem", String(params.isSystem));
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await request<EmailTemplate[]>(`/templates/v1${queryStr}`, {
      method: "GET",
    });
  },

  /**
   * 2. Get aggregated template metrics and KPI stats
   */
  async getStats() {
    return await request<TemplateStats>("/templates/v1/stats", {
      method: "GET",
    });
  },

  /**
   * 3. Get single template details by ID or Slug
   */
  async getById(idOrSlug: string) {
    return await request<EmailTemplate>(`/templates/v1/${idOrSlug}`, {
      method: "GET",
    });
  },

  /**
   * 4. Create new email template and optionally sync to Plunk
   */
  async create(payload: CreateTemplateDTO) {
    return await request<EmailTemplate>("/templates/v1", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Update existing template
   */
  async update(id: string, payload: UpdateTemplateDTO) {
    return await request<EmailTemplate>(`/templates/v1/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Reset a codebase system template back to default source code layout
   */
  async resetToDefault(idOrSlug: string) {
    return await request<EmailTemplate>(`/templates/v1/${idOrSlug}/reset`, {
      method: "POST",
    });
  },

  /**
   * 7. Synchronize single template to Plunk
   */
  async syncSingle(id: string) {
    return await request<EmailTemplate>(`/templates/v1/${id}/sync`, {
      method: "POST",
    });
  },

  /**
   * 8. Batch synchronize all templates to Plunk
   */
  async syncAll() {
    return await request<{
      total: number;
      synced: number;
      failed: number;
      details: { id: string; name: string; plunkId?: string; status: string; error?: string }[];
    }>("/templates/v1/sync", {
      method: "POST",
    });
  },

  /**
   * 9. Duplicate template
   */
  async duplicate(id: string) {
    return await request<EmailTemplate>(`/templates/v1/${id}/duplicate`, {
      method: "POST",
    });
  },

  /**
   * 10. Delete template (custom templates only; codebase templates blocked by backend)
   */
  async delete(id: string, force: boolean = false) {
    const query = force ? "?force=true" : "";
    return await request<{ success: boolean; message: string }>(`/templates/v1/${id}${query}`, {
      method: "DELETE",
    });
  },

  /**
   * 11. Render live Liquid template preview with context data
   */
  async preview(payload: PreviewTemplateDTO) {
    return await request<{ subject: string; body: string; success: boolean; error?: string }>(
      "/templates/v1/preview",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  async renderPreview(payload: PreviewTemplateDTO) {
    return this.preview(payload);
  },

  /**
   * 12. Send test email using template
   */
  async sendTestEmail(payload: SendTestEmailDTO) {
    return await request<{ success: boolean; to: string; subject: string; message: string }>(
      "/templates/v1/send-test",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 13. Fetch remote templates directly from Plunk API
   */
  async getRemotePlunkTemplates() {
    return await request<any>("/templates/v1/remote", {
      method: "GET",
    });
  },
};

