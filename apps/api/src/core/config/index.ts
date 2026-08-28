import { apiEnv } from "@workspace/env/api"

export const config = {
  server: {
    port: apiEnv.PORT,
    env: apiEnv.NODE_ENV,
    isProduction: apiEnv.NODE_ENV === "production",
    isDevelopment: apiEnv.NODE_ENV === "development",
    isTest: apiEnv.NODE_ENV === "test",
    requestTimeout: apiEnv.REQUEST_TIMEOUT,
  },
  database: {
    url: apiEnv.DATABASE_URL,
    logging: apiEnv.DB_LOGGING,
  },
  security: {
    cors: {
      allowedOrigins: apiEnv.ALLOWED_ORIGINS,
    },
    rateLimit: {
      windowMs: apiEnv.RATE_LIMIT_WINDOW_MS,
      max: apiEnv.RATE_LIMIT_MAX,
    },
    jwt: {
      secret: apiEnv.JWT_SECRET,
      expiresIn: apiEnv.JWT_EXPIRES_IN,
      issuer: apiEnv.JWT_ISSUER,
    },
  },
  defaultAdmin: {
    email: apiEnv.DEFAULT_ADMIN_EMAIL,
    password: apiEnv.DEFAULT_ADMIN_PASSWORD,
  },
  plunk: {
    secretKey: apiEnv.PLUNK_SECRET_KEY,
    apiUrl: apiEnv.PLUNK_API_URL,
    templateId: apiEnv.PLUNK_TEMPLATE_ID,
    confirmationTemplateId: apiEnv.PLUNK_CONFIRMATION_TEMPLATE_ID,
  },
  turnstile: {
    secretKey: apiEnv.TURNSTILE_SECRET_KEY,
  },
  site: {
    webUrl: apiEnv.PUBLIC_WEB_URL,
    dashboardUrl: apiEnv.PUBLIC_DASHBOARD_URL,
  },
  email: {
    personalEmail: apiEnv.PERSONAL_EMAIL,
    replyTo: apiEnv.DEFAULT_REPLY_TO_EMAIL,
    transactionalFrom: apiEnv.TRANSACTIONAL_FROM_EMAIL,
    systemFrom: apiEnv.SYSTEM_FROM_EMAIL,
    authFrom: apiEnv.AUTH_FROM_EMAIL,
    bookingFrom: apiEnv.BOOKING_FROM_EMAIL,
    newsletterFrom: apiEnv.NEWSLETTER_FROM_EMAIL,
  },
  contact: {
    recipientEmail: apiEnv.CONTACT_RECIPIENT_EMAIL,
    rateLimitWindowMs: apiEnv.CONTACT_RATE_LIMIT_WINDOW_MS,
    rateLimitMax: apiEnv.CONTACT_RATE_LIMIT_MAX,
  },
  logging: {
    level: apiEnv.LOG_LEVEL,
    path: apiEnv.LOG_FILE_PATH,
  },
  storage: {
    provider: apiEnv.STORAGE_PROVIDER,
    endpoint:
      apiEnv.R2_ENDPOINT ||
      (apiEnv.R2_ACCOUNT_ID
        ? `https://${apiEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined),
    accountId: apiEnv.R2_ACCOUNT_ID,
    region: apiEnv.R2_REGION,
    accessKeyId: apiEnv.R2_ACCESS_KEY_ID,
    secretAccessKey: apiEnv.R2_SECRET_ACCESS_KEY,
    bucket: apiEnv.R2_BUCKET_NAME,
    publicDomain: apiEnv.R2_PUBLIC_DOMAIN,
    maxFileSize: apiEnv.STORAGE_MAX_FILE_SIZE,
    defaultPresignedExpiresIn: apiEnv.STORAGE_PRESIGNED_EXPIRES_IN,
    allowedMimeTypes: (apiEnv.STORAGE_ALLOWED_MIME_TYPES || "")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean) as string[],
  },
  google: {
    clientId: apiEnv.GOOGLE_CLIENT_ID,
    clientSecret: apiEnv.GOOGLE_CLIENT_SECRET,
    redirectUri: apiEnv.GOOGLE_REDIRECT_URI,
    authCallbackUrl: apiEnv.GOOGLE_AUTH_CALLBACK_URL,
  },
  booking: {
    adminEmail:
      apiEnv.BOOKING_NOTIFICATION_EMAIL ||
      apiEnv.CONTACT_RECIPIENT_EMAIL ||
      "fi@amanillah.com",
    rateLimitWindowMs: apiEnv.BOOKING_RATE_LIMIT_WINDOW_MS,
    rateLimitMax: apiEnv.BOOKING_RATE_LIMIT_MAX,
  },
  redis: {
    host: apiEnv.REDIS_HOST,
    port: apiEnv.REDIS_PORT,
    password: apiEnv.REDIS_PASSWORD || undefined,
    db: apiEnv.REDIS_DB,
    keyPrefix: apiEnv.REDIS_KEY_PREFIX,
    url: apiEnv.REDIS_URL,
    defaultTTLSeconds: apiEnv.REDIS_DEFAULT_TTL,
  },
}

export default config
