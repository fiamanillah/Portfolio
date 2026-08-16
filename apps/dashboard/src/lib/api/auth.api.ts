// apps/dashboard/src/lib/api/auth.api.ts
import type { AuthUser, LoginInput } from "@workspace/shared";
import { request, setStoredAccessToken } from "./client";

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
