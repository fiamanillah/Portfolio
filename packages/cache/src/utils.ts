/**
 * Generates a consistent, colon-delimited cache key from namespace and key segments.
 * Filters out null, undefined, or empty segments.
 *
 * @example
 * buildCacheKey("api", "posts", "page-1") => "api:posts:page-1"
 */
export function buildCacheKey(...segments: (string | number | undefined | null)[]): string {
  return segments
    .filter((s): s is string | number => s !== undefined && s !== null && s !== "")
    .map((s) => String(s).trim())
    .join(":")
}

/**
 * Safely stringifies a value to JSON.
 */
export function safeStringify<T>(value: T): string {
  if (typeof value === "string") {
    return value
  }
  return JSON.stringify(value)
}

/**
 * Safely parses a JSON string. If parsing fails, returns raw string or null.
 */
export function safeParse<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}
