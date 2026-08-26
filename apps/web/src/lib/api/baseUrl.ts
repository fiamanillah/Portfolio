// apps/web/src/lib/api/baseUrl.ts

export function getApiBaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    return isLocal ? "http://localhost:3040" : "https://api-fi.amanillah.com"
  }
  return process.env.NODE_ENV === "production"
    ? "https://api-fi.amanillah.com"
    : "http://localhost:3040"
}
