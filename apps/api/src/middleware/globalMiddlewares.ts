// src/middleware/globalMiddlewares.ts
import express, { Express, Request, Response, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import { config } from "@/core/config"
import { requestLogger } from "./requestLogger"
import { requestId } from "./requestId"
import { TimeoutError, RateLimitError } from "@/core/errors/AppError"
import { securityHeaders } from "./security"
import timeout from "connect-timeout"

export function setupGlobalMiddlewares(app: Express) {
  app.set("trust proxy", 1)
  app.use(requestId())
  app.use(securityHeaders())
  app.use(
    helmet({
      contentSecurityPolicy: config.server.isProduction,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    })
  )

  // Build a normalized list of allowed origins
  const configuredOrigins = (config.security.cors.allowedOrigins || "")
    .split(",")
    .map((url) => url.trim().toLowerCase().replace(/\/$/, ""))
    .filter(Boolean)

  const dynamicOrigins = [config.site.webUrl, config.site.dashboardUrl]
    .filter(Boolean)
    .map((url) => url.trim().toLowerCase().replace(/\/$/, ""))

  const allowedOriginsSet = new Set([...configuredOrigins, ...dynamicOrigins])

  // Regex pattern for all authorized subdomains under amanillah.com (HTTPS)
  const productionDomainRegex =
    /^https:\/\/(?:[a-zA-Z0-9-]+\.)*amanillah\.com$/i
  // Regex pattern for localhost / 127.0.0.1 on any port in development
  const localDevRegex = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true)

        const normalizedOrigin = origin.trim().toLowerCase().replace(/\/$/, "")

        // 1. Wildcard allow
        if (allowedOriginsSet.has("*")) {
          return callback(null, true)
        }

        // 2. Allow any local dev origin in development/test
        if (
          !config.server.isProduction &&
          localDevRegex.test(normalizedOrigin)
        ) {
          return callback(null, true)
        }

        // 3. Exact match against configured or dynamic origins
        if (allowedOriginsSet.has(normalizedOrigin)) {
          return callback(null, true)
        }

        // 4. Match any authorized amanillah.com subdomain (e.g. fi.amanillah.com, admin-fi.amanillah.com)
        if (productionDomainRegex.test(normalizedOrigin)) {
          return callback(null, true)
        }

        // If not matched, reject origin
        return callback(null, false)
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Request-Id",
        "X-Turnstile-Token",
        "Cache-Control",
        "Pragma",
      ],
      exposedHeaders: ["X-Request-Id", "Content-Disposition"],
      optionsSuccessStatus: 200,
      maxAge: 86400, // 24 hours preflight caching
    })
  )

  app.use(cookieParser())
  app.use(express.json({ limit: "10mb" }))
  app.use(express.urlencoded({ extended: true, limit: "10mb" }))
  app.use(requestLogger())

  // Timeout middleware
  const timeoutMs = config.server.requestTimeout || 30000
  app.use(timeout(`${timeoutMs}ms`))

  app.use((req: Request, res: Response, next: NextFunction) => {
    const controller = new AbortController()
    req.abortSignal = controller.signal

    // Trigger AbortSignal if connect-timeout fires
    req.on("timeout", () => {
      controller.abort("Request Timeout")
    })

    // Trigger AbortSignal if the user closes their browser tab early
    res.on("close", () => {
      if (!res.writableFinished && !req.timedout) {
        controller.abort("Client Disconnected")
      }
    })

    next()
  })

  // Rate Limiting
  if (config.server.isProduction) {
    app.use(
      rateLimit({
        windowMs: config.security.rateLimit.windowMs,
        max: config.security.rateLimit.max,
        handler: (_: Request, __: Response, next: NextFunction) => {
          next(new RateLimitError("Too many requests"))
        },
        skip: (req) => req.path === "/health",
      })
    )
  }
}
