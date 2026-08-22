// apps/dashboard/src/lib/api/client.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3040"

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

export interface ApiValidationIssue {
  path: string
  message: string
  code?: string
}

export interface ApiErrorDetails {
  issues?: ApiValidationIssue[]
  invalidFields?: number
  [key: string]: any
}

export interface ApiErrorBody {
  message: string
  code?: string
  statusCode?: number
  timestamp?: string
  requestId?: string
  details?: ApiErrorDetails
  stack?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errorCode?: string
  errorDetails?: ApiErrorDetails
  errorIssues?: ApiValidationIssue[]
  errorObj?: ApiErrorBody
  statusCode?: number
  requestId?: string
  pagination?: {
    total: number
    page: number
    limit: number
    pages?: number
    totalPages?: number
  }
  stats?: any
  meta?: any
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/v1/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      const body = await res.json().catch(() => null)
      if (res.ok && body?.data?.accessToken) {
        setStoredAccessToken(body.data.accessToken)
        return body.data.accessToken as string
      }
      setStoredAccessToken(null)
      return null
    } catch {
      setStoredAccessToken(null)
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function request<T>(
  endpoint: string,
  options: RequestInit & { _isRetry?: boolean } = {}
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

    // Handle 401 Unauthorized with silent refresh
    if (
      res.status === 401 &&
      !options._isRetry &&
      !endpoint.includes("/auth/v1/refresh-token") &&
      !endpoint.includes("/auth/v1/login")
    ) {
      const newToken = await attemptTokenRefresh()
      if (newToken) {
        return await request<T>(endpoint, {
          ...options,
          _isRetry: true,
        })
      }
    }

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      const errorObj: ApiErrorBody | undefined =
        body?.error && typeof body.error === "object"
          ? body.error
          : typeof body === "object" && body !== null
            ? (body as ApiErrorBody)
            : undefined

      const errorIssues: ApiValidationIssue[] | undefined =
        errorObj?.details?.issues || body?.details?.issues

      const rawMsg =
        errorObj?.message ||
        body?.message ||
        `Request failed with status ${res.status}`

      let formattedErrorMsg = rawMsg
      if (errorIssues && errorIssues.length > 0) {
        const issuesSummary = errorIssues
          .map((iss) => (iss.path ? `${iss.path}: ${iss.message}` : iss.message))
          .join("; ")
        formattedErrorMsg = `${rawMsg} (${issuesSummary})`
      }

      return {
        success: false,
        error: formattedErrorMsg,
        message: formattedErrorMsg,
        errorCode: errorObj?.code || body?.code,
        errorDetails: errorObj?.details || body?.details,
        errorIssues,
        errorObj,
        statusCode: res.status,
        requestId: errorObj?.requestId || body?.requestId,
      }
    }

    if (body && typeof body === "object") {
      if (body.success === false) {
        const errorObj =
          body.error && typeof body.error === "object" ? body.error : body
        const errorIssues: ApiValidationIssue[] | undefined =
          errorObj?.details?.issues || body?.details?.issues
        const rawMsg = errorObj?.message || body.message || "Operation failed"
        let formattedErrorMsg = rawMsg
        if (errorIssues && errorIssues.length > 0) {
          const issuesSummary = errorIssues
            .map((iss) => (iss.path ? `${iss.path}: ${iss.message}` : iss.message))
            .join("; ")
          formattedErrorMsg = `${rawMsg} (${issuesSummary})`
        }

        return {
          success: false,
          error: formattedErrorMsg,
          message: formattedErrorMsg,
          errorCode: errorObj?.code || body.code,
          errorDetails: errorObj?.details || body.details,
          errorIssues,
          errorObj,
          statusCode: res.status,
          requestId: errorObj?.requestId || body?.requestId,
        }
      }

      return {
        success: true,
        data: (body.data !== undefined ? body.data : body) as T,
        pagination: body.pagination || body.meta?.pagination,
        stats: body.stats,
        meta: body.meta,
        message: body.message,
      }
    }

    return { success: true, data: body as T }
  } catch (err: any) {
    const errMsg = err?.message || "Network error. Please try again."
    return {
      success: false,
      error: errMsg,
      message: errMsg,
      errorCode: "NETWORK_ERROR",
    }
  }
}
