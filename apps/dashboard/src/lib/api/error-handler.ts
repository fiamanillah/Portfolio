// apps/dashboard/src/lib/api/error-handler.ts

import { toast } from "@workspace/ui/components/sonner"
import type { ApiResponse, ApiValidationIssue } from "./client"

export interface FormattedError {
  title: string
  description: string
  issues: ApiValidationIssue[]
  fieldErrors: Record<string, string>
  code?: string
  statusCode?: number
  requestId?: string
}

const FIELD_LABEL_MAP: Record<string, string> = {
  "seo.canonicalUrl": "Canonical URL",
  canonicalUrl: "Canonical URL",
  "seo.metaTitle": "SEO Meta Title",
  metaTitle: "SEO Meta Title",
  "seo.metaDescription": "SEO Meta Description",
  metaDescription: "SEO Meta Description",
  "seo.ogTitle": "Open Graph Title",
  "seo.ogDescription": "Open Graph Description",
  "seo.ogImage": "Open Graph Image",
  "seo.twitterTitle": "Twitter Title",
  "seo.twitterDescription": "Twitter Description",
  "seo.twitterImage": "Twitter Image",
  "seo.articleType": "Article Type",
  "author.name": "Author Name",
  "author.role": "Author Role",
  "author.avatar": "Author Avatar",
  "author.twitter": "Author Twitter URL/Handle",
  "author.linkedin": "Author LinkedIn URL",
  "author.github": "Author GitHub URL",
  title: "Title",
  subtitle: "Subtitle",
  slug: "Slug URL",
  summary: "Summary Excerpt",
  content: "Content Body",
  thumbnail: "Cover Thumbnail URL",
  image: "Cover Image URL",
  liveUrl: "Live Project URL",
  githubUrl: "GitHub Repository URL",
  company: "Company Name",
  companyUrl: "Company Website URL",
  role: "Role / Position",
  year: "Year",
  period: "Period / Duration",
  description: "Description",
  name: "Name",
  email: "Email Address",
  senderEmail: "Sender Email",
  replyTo: "Reply-To Email",
  subject: "Subject Line",
  password: "Password",
  currentPassword: "Current Password",
  newPassword: "New Password",
  version: "Version Number",
}

export function humanizeFieldPath(path: string): string {
  if (!path) return "General Field"
  if (FIELD_LABEL_MAP[path]) return FIELD_LABEL_MAP[path]

  // Handle array paths like "tags.0" -> "Tag #1", "keyTakeaways.1" -> "Key Takeaway #2"
  const arrayMatch = path.match(/^([a-zA-Z0-9_]+)\.(\d+)$/)
  if (arrayMatch) {
    const parentName = arrayMatch[1]
    const index = parseInt(arrayMatch[2], 10) + 1
    const baseLabel = FIELD_LABEL_MAP[parentName] || parentName
    return `${baseLabel} #${index}`
  }

  // Fallback: convert camelCase or dot.notation to Title Case
  return path
    .split(".")
    .map((part) =>
      part
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    )
    .join(" → ")
}

export function formatApiError(
  resOrError: ApiResponse<any> | Error | string | unknown,
  defaultTitle?: string
): FormattedError {
  let title = defaultTitle || "Operation Failed"
  let description = "An unexpected error occurred. Please try again."
  let issues: ApiValidationIssue[] = []
  let fieldErrors: Record<string, string> = {}
  let code: string | undefined
  let statusCode: number | undefined
  let requestId: string | undefined

  if (!resOrError) {
    return { title, description, issues, fieldErrors }
  }

  // 1. If it's a string
  if (typeof resOrError === "string") {
    description = resOrError
    return { title, description, issues, fieldErrors }
  }

  // 2. If it's an Error instance
  if (resOrError instanceof Error) {
    description = resOrError.message || "An error occurred"
    return { title, description, issues, fieldErrors }
  }

  // 3. If it's an ApiResponse or API error object
  if (typeof resOrError === "object") {
    const apiRes = resOrError as ApiResponse<any> & {
      error?: any
      message?: string
      details?: any
    }

    code = apiRes.errorCode || apiRes.errorObj?.code
    statusCode = apiRes.statusCode || apiRes.errorObj?.statusCode
    requestId = apiRes.requestId || apiRes.errorObj?.requestId

    // Extract issues from all possible response locations
    const candidateIssues =
      apiRes.errorIssues ||
      apiRes.errorDetails?.issues ||
      apiRes.errorObj?.details?.issues ||
      (Array.isArray(apiRes.details?.issues) ? apiRes.details.issues : [])

    if (Array.isArray(candidateIssues) && candidateIssues.length > 0) {
      issues = candidateIssues
    }

    // Build field errors map
    issues.forEach((iss) => {
      if (iss.path) {
        fieldErrors[iss.path] = iss.message
        // Also map leaf key (e.g. "seo.canonicalUrl" -> also map "canonicalUrl")
        const leafKey = iss.path.split(".").pop()
        if (leafKey && leafKey !== iss.path) {
          fieldErrors[leafKey] = iss.message
        }
      }
    })

    // Determine Title based on status/code
    if (statusCode === 400 || code === "VALIDATION_ERROR" || issues.length > 0) {
      const issueCount = issues.length
      title =
        issueCount > 0
          ? `Validation Error (${issueCount} invalid field${issueCount > 1 ? "s" : ""})`
          : "Invalid Form Submission"
    } else if (statusCode === 401 || code === "UNAUTHORIZED") {
      title = "Authentication Required"
      description = "Your session may have expired. Please sign in again."
    } else if (statusCode === 403 || code === "FORBIDDEN") {
      title = "Access Denied"
      description = "You do not have permission to perform this action."
    } else if (statusCode === 404 || code === "NOT_FOUND") {
      title = "Item Not Found"
    } else if (statusCode === 409 || code === "CONFLICT" || code === "ALREADY_EXISTS") {
      title = "Conflict / Already Exists"
    } else if (statusCode === 413 || code === "PAYLOAD_TOO_LARGE") {
      title = "Payload Too Large"
      description = "The uploaded file or payload exceeds the maximum allowed size."
    } else if (statusCode === 429 || code === "RATE_LIMIT_EXCEEDED") {
      title = "Rate Limit Exceeded"
      description = "Too many requests. Please wait a few moments before trying again."
    } else if (statusCode && statusCode >= 500) {
      title = "Server Error"
      description = "The server encountered an error processing your request."
    }

    // Format Detailed Description
    if (issues.length > 0) {
      const issueDescriptions = issues.map((iss) => {
        const label = humanizeFieldPath(iss.path)
        return `• ${label}: ${iss.message}`
      })
      description = issueDescriptions.join("\n")
    } else if (apiRes.message && apiRes.message !== "Request validation failed") {
      description = apiRes.message
    } else if (apiRes.error && apiRes.error !== "Request validation failed") {
      description = apiRes.error
    }
  }

  return {
    title,
    description,
    issues,
    fieldErrors,
    code,
    statusCode,
    requestId,
  }
}

/**
 * Display a user-friendly, rich Sonner toast for any error response
 */
export function showApiError(
  resOrError: ApiResponse<any> | Error | string | unknown,
  fallbackTitle?: string
): FormattedError {
  const formatted = formatApiError(resOrError, fallbackTitle)

  toast.error(formatted.title, {
    description: formatted.description,
    duration: formatted.issues.length > 1 ? 8000 : 5000,
  })

  return formatted
}

/**
 * Extract field-level errors as a Record<string, string>
 */
export function extractFieldErrors(
  res: ApiResponse<any> | unknown
): Record<string, string> {
  const formatted = formatApiError(res)
  return formatted.fieldErrors
}

/**
 * Pre-validate whether a given string is a valid HTTP/HTTPS URL
 */
export function validateUrl(
  url?: string | null,
  fieldLabel = "URL"
): { valid: boolean; error?: string; formatted?: string } {
  if (!url || typeof url !== "string") {
    return { valid: true }
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return { valid: true }
  }

  // Check if starts with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} must start with http:// or https:// (e.g. https://example.com)`,
    }
  }

  try {
    const parsed = new URL(trimmed)
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return {
        valid: false,
        error: `${fieldLabel} must have a valid domain (e.g. https://example.com)`,
      }
    }
    return { valid: true, formatted: trimmed }
  } catch {
    return {
      valid: false,
      error: `${fieldLabel} is not a valid URL format`,
    }
  }
}

/**
 * Pre-validate slug format
 */
export function validateSlug(
  slug?: string | null,
  fieldLabel = "Slug"
): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== "string") {
    return { valid: true }
  }

  const trimmed = slug.trim()
  if (!trimmed) {
    return { valid: true }
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} must only contain lowercase alphanumeric characters and single hyphens (e.g. 'my-first-post')`,
    }
  }

  return { valid: true }
}

/**
 * Pre-validate email format
 */
export function validateEmail(
  email?: string | null,
  fieldLabel = "Email"
): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: true }
  }

  const trimmed = email.trim()
  if (!trimmed) {
    return { valid: true }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} must be a valid email address (e.g. name@example.com)`,
    }
  }

  return { valid: true }
}

/**
 * Clean URL string helper - returns undefined if empty or whitespace
 */
export function cleanUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined
  const trimmed = url.trim()
  return trimmed || undefined
}
