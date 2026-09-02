import { z } from "zod"
import { formatEnvErrors, loadEnv } from "./loader.js"

export const dbEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required for database connectivity")
    .default(
      process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/placeholder_db"
    ),
  DB_LOGGING: z
    .preprocess((val) => val === true || val === "true", z.boolean())
    .default(false),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

export type DbEnv = z.infer<typeof dbEnvSchema>

let cachedDbEnv: DbEnv | null = null

export function getDbEnv(overrides?: Record<string, unknown>): DbEnv {
  if (cachedDbEnv && !overrides) {
    return cachedDbEnv
  }

  loadEnv()
  const raw = { ...process.env, ...overrides }
  const result = dbEnvSchema.safeParse(raw)

  if (!result.success) {
    const formatted = formatEnvErrors(result.error, "@workspace/db")
    console.error(formatted)
    throw new Error(
      `Database environment validation failed:\n${result.error.message}`
    )
  }

  if (!overrides) {
    cachedDbEnv = result.data
  }

  return result.data
}

export const dbEnv = getDbEnv()
