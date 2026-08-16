// src/lib/api/authApi.ts
import type {
  AuthUser,
  InitiateRegisterInput,
  VerifyRegisterOtpInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@workspace/shared";

export type InitiateRegisterPayload = InitiateRegisterInput;
export type VerifyRegisterOtpPayload = VerifyRegisterOtpInput;
export type LoginPayload = LoginInput;
export type ResetPasswordPayload = ResetPasswordInput;
export type UpdateProfilePayload = UpdateProfileInput;

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  "http://localhost:3030";

const ACCESS_TOKEN_KEY = "portfolio_access_token";

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
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
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
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Network error. Please check your server connection.",
    };
  }
}

export const AuthApi = {
  /**
   * 1. Initiate user registration (sends Plunk OTP email)
   */
  async initiateRegister(payload: InitiateRegisterPayload) {
    return await request<{ email: string; message: string }>(
      "/auth/v1/register/initiate",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 2. Verify registration OTP & activate user account
   */
  async verifyRegisterOtp(payload: VerifyRegisterOtpPayload) {
    const res = await request<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/v1/register/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken);
    }

    return res;
  },

  /**
   * 3. Sign in with email & password
   */
  async login(payload: LoginPayload) {
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
   * 4. 1-Click Demo Login
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
   * 5. Request Password Reset OTP
   */
  async forgotPassword(email: string) {
    return await request<{ message: string }>("/auth/v1/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * 6. Verify Password Reset OTP
   */
  async verifyResetOtp(email: string, otpCode: string) {
    return await request<{ message: string }>("/auth/v1/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otpCode }),
    });
  },

  /**
   * 7. Reset Password
   */
  async resetPassword(payload: ResetPasswordPayload) {
    const res = await request<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/v1/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken);
    }

    return res;
  },

  /**
   * 8. Resend OTP Code
   */
  async resendOtp(email: string, type: "REGISTER_EMAIL_VERIFY" | "PASSWORD_RESET") {
    return await request<{ message: string }>("/auth/v1/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email, type }),
    });
  },

  /**
   * 9. Get current authenticated user
   */
  async getMe() {
    return await request<AuthUser>("/auth/v1/me", {
      method: "GET",
    });
  },

  /**
   * 10. Update Profile
   */
  async updateProfile(payload: UpdateProfilePayload) {
    return await request<AuthUser>("/users/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 11. Change Password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    return await request<{ message: string }>("/users/v1/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * 12. Update Newsletter Subscription
   */
  async updateSubscription(subscribedToNewsletter: boolean) {
    return await request<{ subscribedToNewsletter: boolean }>("/users/v1/subscription", {
      method: "PATCH",
      body: JSON.stringify({ subscribedToNewsletter }),
    });
  },

  /**
   * 13. Delete Account
   */
  async deleteAccount() {
    const res = await request<{ message: string }>("/users/v1/account", {
      method: "DELETE",
    });
    setStoredAccessToken(null);
    return res;
  },

  /**
   * 14. Sign Out
   */
  async logout() {
    await request("/auth/v1/logout", {
      method: "POST",
    });
    setStoredAccessToken(null);
  },
};
