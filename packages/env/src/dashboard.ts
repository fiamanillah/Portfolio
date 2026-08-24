import { z } from "zod"
import { formatEnvErrors, loadEnv } from "./loader.js"

export const dashboardEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:3040"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .optional()
    .default("http://localhost:4321"),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

export type DashboardEnv = z.infer<typeof dashboardEnvSchema>

let cachedDashboardEnv: DashboardEnv | null = null

export function getDashboardEnv(overrides?: Record<string, unknown>): DashboardEnv {
  if (cachedDashboardEnv && !overrides) {
    return cachedDashboardEnv
  }

  loadEnv()
  const raw = { ...process.env, ...overrides }
  const result = dashboardEnvSchema.safeParse(raw)

  if (!result.success) {
    const formatted = formatEnvErrors(result.error, "apps/dashboard")
    console.error(formatted)
    throw new Error(`Dashboard environment validation failed:\n${result.error.message}`)
  }

  if (!overrides) {
    cachedDashboardEnv = result.data
  }

  return result.data
}

export const dashboardEnv = getDashboardEnv()
