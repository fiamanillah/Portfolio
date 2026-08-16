// apps/dashboard/src/lib/api.ts
import type {
  AuthUser,
  LoginInput,
  UpdateProfileInput,
  Role,
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
    pages: number;
  };
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
