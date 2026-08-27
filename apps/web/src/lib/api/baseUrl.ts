// apps/web/src/lib/api/baseUrl.ts

export function getApiBaseUrl(): string {
  const isProd =
    (typeof import.meta !== "undefined" && import.meta.env?.PROD) ||
    process.env.NODE_ENV === "production"

  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    return isLocal ? "http://localhost:3040" : "https://api-fi.amanillah.com"
  }

  const envUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
    process.env.PUBLIC_API_URL

  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, "")
    if (isProd && cleanUrl.includes("localhost")) {
      return "https://api-fi.amanillah.com"
    }
    return cleanUrl
  }

  return isProd ? "https://api-fi.amanillah.com" : "http://localhost:3040"
}
