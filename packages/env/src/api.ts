import { z } from "zod"
import { formatEnvErrors, loadEnv } from "./loader.js"

export const apiEnvSchema = z
  .object({
    // Server
    PORT: z.coerce.number().default(3040),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    REQUEST_TIMEOUT: z.coerce.number().default(30000),

    // Database
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required for database connectivity"),
    DB_LOGGING: z
      .preprocess((val) => val === true || val === "true", z.boolean())
      .default(false),

    // Security & Auth
    ALLOWED_ORIGINS: z
      .string()
      .default(
        "http://localhost:4321,http://localhost:3001,http://localhost:3000,http://localhost:5173,http://127.0.0.1:4321,https://fi.amanillah.com,https://admin-fi.amanillah.com"
      ),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    JWT_SECRET: z.string().default("your-secret-key-here"),
    JWT_EXPIRES_IN: z.string().default("1d"),
    JWT_ISSUER: z.string().default("ignitor-app"),

    // Admin Seeds
    DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@example.com"),
    DEFAULT_ADMIN_PASSWORD: z.string().default("change-me-immediately"),

    // Public Domain & Service URLs
    PUBLIC_WEB_URL: z
      .string()
      .url()
      .default(
        process.env.NODE_ENV === "production"
          ? "https://fi.amanillah.com"
          : "http://localhost:4321"
      ),
    PUBLIC_API_URL: z
      .string()
      .url()
      .default(
        process.env.NODE_ENV === "production"
          ? "https://api-fi.amanillah.com"
          : "http://localhost:3040"
      ),
    PUBLIC_DASHBOARD_URL: z
      .string()
      .url()
      .default(
        process.env.NODE_ENV === "production"
          ? "https://admin-fi.amanillah.com"
          : "http://localhost:3001"
      ),

    // Email Delivery (Plunk)
    PLUNK_SECRET_KEY: z.string().default(""),
    PLUNK_API_URL: z.string().url().default("https://next-api.useplunk.com"),
    PLUNK_TEMPLATE_ID: z.string().optional(),
    PLUNK_CONFIRMATION_TEMPLATE_ID: z.string().optional(),

    // Email Identities
    PERSONAL_EMAIL: z.string().email().default("fi@amanillah.com"),
    DEFAULT_REPLY_TO_EMAIL: z.string().email().default("fi@amanillah.com"),
    TRANSACTIONAL_FROM_EMAIL: z
      .string()
      .email()
      .default("hello@mail.amanillah.com"),
    SYSTEM_FROM_EMAIL: z.string().email().default("system@mail.amanillah.com"),
    AUTH_FROM_EMAIL: z.string().email().default("auth@mail.amanillah.com"),
    BOOKING_FROM_EMAIL: z
      .string()
      .email()
      .default("bookings@mail.amanillah.com"),
    NEWSLETTER_FROM_EMAIL: z
      .string()
      .email()
      .default("newsletter@newsletter.amanillah.com"),
    BOOKING_NOTIFICATION_EMAIL: z.string().email().default("fi@amanillah.com"),

    // Turnstile Anti-Bot
    TURNSTILE_SECRET_KEY: z.string().default(""),

    // Contact
    CONTACT_RECIPIENT_EMAIL: z.string().email().default("fi@amanillah.com"),
    CONTACT_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(3600000),
    CONTACT_RATE_LIMIT_MAX: z.coerce.number().default(5),

    // Logging
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
      .default("debug"),
    LOG_FILE_PATH: z.string().default("logs/app.log"),

    // Storage (Cloudflare R2 / S3)
    STORAGE_PROVIDER: z.enum(["r2", "s3"]).default("r2"),
    R2_ACCOUNT_ID: z.string().default(""),
    R2_ACCESS_KEY_ID: z.string().default(""),
    R2_SECRET_ACCESS_KEY: z.string().default(""),
    R2_BUCKET_NAME: z.string().default("portfolio-assets"),
    R2_PUBLIC_DOMAIN: z.string().default(""),
    R2_REGION: z.string().default("apac"),
    R2_ENDPOINT: z.string().optional(),
    STORAGE_MAX_FILE_SIZE: z.coerce.number().default(52428800),
    STORAGE_PRESIGNED_EXPIRES_IN: z.coerce.number().default(900),
    STORAGE_ALLOWED_MIME_TYPES: z.string().optional(),

    // Google Calendar & OAuth
    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),
    GOOGLE_REDIRECT_URI: z
      .string()
      .default(
        process.env.NODE_ENV === "production"
          ? "https://api-fi.amanillah.com/booking/v1/google/callback"
          : "http://localhost:3040/booking/v1/google/callback"
      ),
    GOOGLE_AUTH_CALLBACK_URL: z
      .string()
      .default(
        process.env.NODE_ENV === "production"
          ? "https://api-fi.amanillah.com/auth/v1/google/callback"
          : "http://localhost:3040/auth/v1/google/callback"
      ),

    // Booking Engine
    BOOKING_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(3600000),
    BOOKING_RATE_LIMIT_MAX: z.coerce.number().default(10),

    // Redis Cache
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6380),
    REDIS_PASSWORD: z.string().default(""),
    REDIS_DB: z.coerce.number().default(0),
    REDIS_KEY_PREFIX: z.string().default("portfolio:api:"),
    REDIS_URL: z.string().optional(),
    REDIS_DEFAULT_TTL: z.coerce.number().default(3600),
  })

  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      const placeholders = [
        "your-secret-key-here",
        "change-me",
        "secret",
        "jwt-secret",
        "portfolio-auth-jwt-secret",
      ]
      if (
        !data.JWT_SECRET ||
        placeholders.includes(data.JWT_SECRET.toLowerCase())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "JWT_SECRET cannot be empty or a default placeholder in production mode.",
          path: ["JWT_SECRET"],
        })
      }
    }
  })

export type ApiEnv = z.infer<typeof apiEnvSchema>

let cachedApiEnv: ApiEnv | null = null

export function getApiEnv(overrides?: Record<string, unknown>): ApiEnv {
  if (cachedApiEnv && !overrides) {
    return cachedApiEnv
  }

  loadEnv()
  const raw = { ...process.env, ...overrides }
  const result = apiEnvSchema.safeParse(raw)

  if (!result.success) {
    const formatted = formatEnvErrors(result.error, "apps/api")
    console.error(formatted)
    throw new Error(
      `API environment validation failed:\n${result.error.message}`
    )
  }

  if (!overrides) {
    cachedApiEnv = result.data
  }

  return result.data
}

export const apiEnv = getApiEnv()
