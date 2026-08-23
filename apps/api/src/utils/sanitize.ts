// src/utils/sanitize.ts
// Centralized input sanitization utility for XSS prevention.
// Use this everywhere instead of module-local sanitizers.

/**
 * Sanitizes user input by encoding HTML entities to prevent XSS attacks.
 * Use for any user-provided text that will be rendered in emails, HTML, or stored in the database.
 */
export function sanitizeInput(text?: string | null): string {
  if (!text) return ""
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}
