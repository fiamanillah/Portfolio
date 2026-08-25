// apps/web/src/lib/api/resumeApi.ts

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return (
      (import.meta as any).env?.PUBLIC_API_URL || "https://api-fi.amanillah.com"
    ).replace(/\/$/, "")
  }
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
    (typeof process !== "undefined" && process.env?.PUBLIC_API_URL) ||
    "https://api-fi.amanillah.com"
  ).replace(/\/$/, "")
}

export interface ResumeVersionData {
  id: string | null
  title: string
  version: string
  fileName: string
  fileUrl: string | null
  fileSize: number
  mimeType: string
  isActive: boolean
  description: string | null
  downloadCount: number
  updatedAt: string | null
  createdAt: string | null
  downloadEndpoint: string
}

export const ResumeApi = {
  getDownloadUrl(id?: string) {
    const baseUrl = getApiBaseUrl()
    return id
      ? `${baseUrl}/resume/v1/public/${id}/download`
      : `${baseUrl}/resume/v1/public/download`
  },

  /**
   * Fetch active resume version document and metadata from backend
   */
  async fetchActiveResume(): Promise<ResumeVersionData | null> {
    try {
      const baseUrl = getApiBaseUrl()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const isBrowser = typeof window !== "undefined"
      const url = isBrowser
        ? `${baseUrl}/resume/v1/public/active?_t=${Date.now()}`
        : `${baseUrl}/resume/v1/public/active`

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: isBrowser ? "no-store" : "default",
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        return null
      }

      const json = await res.json()
      if (json.success && json.data) {
        const item = json.data
        return {
          id: item.id || null,
          title: item.title || "Full Stack Developer Resume",
          version: item.version || "v2.0",
          fileName: item.fileName || "Fi_Amanillah_Resume.pdf",
          fileUrl: item.fileUrl || null,
          fileSize: Number(item.fileSize) || 0,
          mimeType: item.mimeType || "application/pdf",
          isActive: Boolean(item.isActive),
          description: item.description || null,
          downloadCount: Number(item.downloadCount) || 0,
          updatedAt: item.updatedAt || null,
          createdAt: item.createdAt || null,
          downloadEndpoint: `${baseUrl}/resume/v1/public/download`,
        }
      }

      return null
    } catch {
      return null
    }
  },

  /**
   * Backward-compatible helper for simple url access
   */
  async fetchPublicResume(): Promise<{
    resumeUrl: string | null
    name: string
    version?: string
    downloadUrl: string
  }> {
    const baseUrl = getApiBaseUrl()
    const active = await this.fetchActiveResume()
    return {
      resumeUrl: active?.fileUrl || null,
      name: "Fi Amanillah",
      version: active?.version,
      downloadUrl: `${baseUrl}/resume/v1/public/download`,
    }
  },
}
