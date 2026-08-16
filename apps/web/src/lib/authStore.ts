// src/lib/authStore.ts
import { useSyncExternalStore } from "react";
import type { AuthUser, AuthModalStep } from "@workspace/shared";
import { AuthApi, getStoredAccessToken, setStoredAccessToken } from "@/lib/api/authApi";

export type { AuthModalStep };

const AUTH_STORAGE_KEY = "portfolio_user_session";
const AUTH_EVENT_NAME = "portfolio:auth-change";
export const AUTH_MODAL_EVENT = "portfolio:auth-modal-toggle";

let cachedUserStr: string | null = null;
let cachedUser: AuthUser | null = null;

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw === cachedUserStr) return cachedUser;
    cachedUserStr = raw;
    if (!raw) {
      cachedUser = null;
      return null;
    }
    cachedUser = JSON.parse(raw) as AuthUser;
    return cachedUser;
  } catch (e) {
    console.error("Failed to parse stored auth user:", e);
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      const raw = JSON.stringify(user);
      localStorage.setItem(AUTH_STORAGE_KEY, raw);
      cachedUserStr = raw;
      cachedUser = user;
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      cachedUserStr = null;
      cachedUser = null;
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
  } catch (e) {
    console.error("Failed to update auth user in localStorage:", e);
  }
}

/**
 * Validates and synchronizes the active session with the backend API.
 */
export async function syncAuthSession(): Promise<AuthUser | null> {
  const token = getStoredAccessToken();
  if (!token) {
    setStoredUser(null);
    return null;
  }

  try {
    const res = await AuthApi.getMe();
    if (res.success && res.data) {
      setStoredUser(res.data);
      return res.data;
    } else {
      // Token is invalid or expired
      setStoredAccessToken(null);
      setStoredUser(null);
      return null;
    }
  } catch (e) {
    console.error("Failed to sync session with backend:", e);
    return getStoredUser();
  }
}

/**
 * Logs out the user from both backend and local storage.
 */
export async function logoutUser(): Promise<void> {
  try {
    await AuthApi.logout();
  } catch (e) {
    console.error("Error during logout:", e);
  } finally {
    setStoredAccessToken(null);
    setStoredUser(null);
  }
}

/**
 * URL Query Synchronization for Auth Modal
 */
export function getAuthUrlParam(): AuthModalStep | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth")?.toLowerCase();
  if (
    auth === "signin" ||
    auth === "login" ||
    auth === "signup" ||
    auth === "register" ||
    auth === "register-verify-otp" ||
    auth === "verify-email" ||
    auth === "signup-otp" ||
    auth === "forgot-password" ||
    auth === "forgot" ||
    auth === "verify-otp" ||
    auth === "otp" ||
    auth === "reset-password" ||
    auth === "reset" ||
    auth === "quick"
  ) {
    if (auth === "login" || auth === "quick") return "signin";
    if (auth === "register") return "signup";
    if (auth === "verify-email" || auth === "signup-otp") return "register-verify-otp";
    if (auth === "forgot") return "forgot-password";
    if (auth === "otp") return "verify-otp";
    if (auth === "reset") return "reset-password";
    return auth as AuthModalStep;
  }
  return null;
}

export function setAuthUrlParam(
  step: AuthModalStep | null,
  extraParams?: Record<string, string>
): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (step) {
    url.searchParams.set("auth", step);
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        url.searchParams.set(k, v);
      });
    }
  } else {
    url.searchParams.delete("auth");
    url.searchParams.delete("email");
    url.searchParams.delete("otp");
  }

  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(
    new CustomEvent(AUTH_MODAL_EVENT, {
      detail: { step, open: !!step },
    })
  );
}

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleAuth = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === AUTH_STORAGE_KEY) callback();
  };
  window.addEventListener(AUTH_EVENT_NAME, handleAuth);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handleAuth);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useAuthSession() {
  const user = useSyncExternalStore(subscribeAuth, getStoredUser, () => null);

  return {
    user,
    isLoading: false,
    isAuthenticated: !!user,
    logout: logoutUser,
    syncSession: syncAuthSession,
  };
}
