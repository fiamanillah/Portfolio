import dotenv from "dotenv"

// Load environment variables
const result = dotenv.config()

// Handle .env loading errors
if (result.error) {
  if (result.error.message.includes("ENOENT")) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "⚠️  .env file not found. Please create one based on .env.example"
      )
    } else {
      console.warn(
        "⚠️  .env file not found. Using provided environment variables."
      )
    }
  } else {
    throw new Error(`Failed to load .env file: ${result.error.message}`)
  }
}

// Validate and parse configuration
export const config = {
  server: {
    port: parseInt(process.env.PORT || "3040"),
    env: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isTest: process.env.NODE_ENV === "test",
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "30000"),
  },
  database: {
    url: process.env.DATABASE_URL,
    logging: process.env.DB_LOGGING === "true",
  },
  security: {
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
      max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      issuer: process.env.JWT_ISSUER || "ignitor-app",
    },
  },
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
  },
  plunk: {
    secretKey: process.env.PLUNK_SECRET_KEY || "",
    apiUrl: process.env.PLUNK_API_URL || "https://next-api.useplunk.com",
    templateId: process.env.PLUNK_TEMPLATE_ID,
    confirmationTemplateId: process.env.PLUNK_CONFIRMATION_TEMPLATE_ID,
  },
  turnstile: {
    secretKey: process.env.TURNSTILE_SECRET_KEY || "",
  },
  site: {
    webUrl: process.env.PUBLIC_WEB_URL || "https://fi.amanillah.com",
  },
  contact: {
    recipientEmail: process.env.CONTACT_RECIPIENT_EMAIL || "fi@amanillah.com",
    rateLimitWindowMs: parseInt(
      process.env.CONTACT_RATE_LIMIT_WINDOW_MS || "3600000"
    ), // 1 hour
    rateLimitMax: parseInt(process.env.CONTACT_RATE_LIMIT_MAX || "5"), // 5 requests / IP / hour
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    path: process.env.LOG_FILE_PATH || "logs/app.log",
  },
  storage: {
    provider: (process.env.STORAGE_PROVIDER || "r2") as "r2" | "s3",
    endpoint:
      process.env.R2_ENDPOINT ||
      (process.env.R2_ACCOUNT_ID
        ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined),
    accountId: process.env.R2_ACCOUNT_ID || "",
    region: process.env.R2_REGION || "auto",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucket: process.env.R2_BUCKET_NAME || "portfolio-assets",
    publicDomain: process.env.R2_PUBLIC_DOMAIN || "",
    maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || "52428800"), // 50MB
    defaultPresignedExpiresIn: parseInt(
      process.env.STORAGE_PRESIGNED_EXPIRES_IN || "900"
    ), // 15 minutes
    allowedMimeTypes: (process.env.STORAGE_ALLOWED_MIME_TYPES || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3040/booking/v1/google/callback",
  },
  booking: {
    adminEmail: process.env.BOOKING_NOTIFICATION_EMAIL || process.env.CONTACT_RECIPIENT_EMAIL || "fi@amanillah.dev",
    rateLimitWindowMs: parseInt(
      process.env.BOOKING_RATE_LIMIT_WINDOW_MS || "3600000"
    ), // 1 hour
    rateLimitMax: parseInt(process.env.BOOKING_RATE_LIMIT_MAX || "10"), // 10 bookings / IP / hour
  },
}

export default config
