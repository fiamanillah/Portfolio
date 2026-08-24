import { z } from "zod"
import { formatEnvErrors, loadEnv } from "./loader.js"

export const redisEnvSchema = z.object({
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6380),
  REDIS_PASSWORD: z.string().default(""),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_KEY_PREFIX: z.string().default("portfolio:"),
  REDIS_URL: z.string().optional(),
  REDIS_DEFAULT_TTL: z.coerce.number().default(3600),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

export type RedisEnv = z.infer<typeof redisEnvSchema>

let cachedRedisEnv: RedisEnv | null = null

export function getRedisEnv(overrides?: Record<string, unknown>): RedisEnv {
  if (cachedRedisEnv && !overrides) {
    return cachedRedisEnv
  }

  loadEnv()
  const raw = { ...process.env, ...overrides }
  const result = redisEnvSchema.safeParse(raw)

  if (!result.success) {
    const formatted = formatEnvErrors(result.error, "@workspace/cache")
    console.error(formatted)
    throw new Error(`Redis environment validation failed:\n${result.error.message}`)
  }

  if (!overrides) {
    cachedRedisEnv = result.data
  }

  return result.data
}

export const redisEnv = getRedisEnv()
