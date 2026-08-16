// apps/dashboard/src/lib/api/client.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

export const ACCESS_TOKEN_KEY = "portfolio_access_token"
export const AUTH_COOKIE_NAME = "auth_token"

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
      // Set cookie for Next.js server middleware access
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
        token
      )}; path=/; max-age=2592000; SameSite=Lax`
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
    }
  } catch (e) {
    console.error("Failed to manage access token in storage/cookies:", e)
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    total: number
    page: number
    limit: number
    pages?: number
    totalPages?: number
  }
  stats?: any
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredAccessToken()
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    })

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      const errMsg =
        body?.message ||
        body?.error?.message ||
        `Request failed with status ${res.status}`
      return { success: false, error: errMsg, message: errMsg }
    }

    if (body && typeof body === "object") {
      return {
        success: body.success !== false,
        data: (body.data !== undefined ? body.data : body) as T,
        pagination: body.pagination,
        stats: body.stats,
        message: body.message,
      }
    }

    return { success: true, data: body as T }
  } catch (err: any) {
    const errMsg = err?.message || "Network error. Please try again."
    return { success: false, error: errMsg, message: errMsg }
  }
}
