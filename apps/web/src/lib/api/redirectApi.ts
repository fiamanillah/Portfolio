// apps/web/src/lib/api/redirectApi.ts
import type { ResolvedRedirectDTO } from "@workspace/shared"

import { getApiBaseUrl } from "./baseUrl"

const API_BASE_URL = getApiBaseUrl()

export const RedirectApi = {
  /**
   * Check if a path should be redirected according to 301/308 SEO redirection rules
   */
  async resolveRedirect(path: string): Promise<ResolvedRedirectDTO | null> {
    try {
      const url = `${API_BASE_URL}/redirects/v1/resolve?path=${encodeURIComponent(path)}`
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return body.data as ResolvedRedirectDTO
        }
      }
    } catch (err) {
      console.warn(
        `[RedirectApi] Error resolving redirect for path '${path}':`,
        err
      )
    }

    return null
  },
}
