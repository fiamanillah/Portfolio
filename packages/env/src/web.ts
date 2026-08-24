import { z } from "zod"
import { formatEnvErrors, loadEnv } from "./loader.js"

export const webEnvSchema = z.object({
  PUBLIC_WEB_URL: z
    .string()
    .url("PUBLIC_WEB_URL must be a valid URL")
    .default(
      process.env.NODE_ENV === "production"
        ? "https://fi.amanillah.com"
        : "http://localhost:4321"
    ),
  PUBLIC_API_URL: z
    .string()
    .url("PUBLIC_API_URL must be a valid URL")
    .default(
      process.env.NODE_ENV === "production"
        ? "https://api-fi.amanillah.com"
        : "http://localhost:3040"
    ),
  PUBLIC_TURNSTILE_SITE_KEY: z
    .string()
    .optional()
    .default(""),
  PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .optional()
    .default("G-G8BDG57VX9"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

export type WebEnv = z.infer<typeof webEnvSchema>

let cachedWebEnv: WebEnv | null = null

export function getWebEnv(overrides?: Record<string, unknown>): WebEnv {
  if (cachedWebEnv && !overrides) {
    return cachedWebEnv
  }

  loadEnv()
  const raw = { ...process.env, ...overrides }
  const result = webEnvSchema.safeParse(raw)

  if (!result.success) {
    const formatted = formatEnvErrors(result.error, "apps/web")
    console.error(formatted)
    throw new Error(`Web environment validation failed:\n${result.error.message}`)
  }

  if (!overrides) {
    cachedWebEnv = result.data
  }

  return result.data
}

export const webEnv = getWebEnv()
