import type { Request, Response, NextFunction, RequestHandler } from "express"
import type { ICacheManager } from "./types.js"
import { buildCacheKey } from "./utils.js"

export interface CacheResponseOptions {
  /**
   * Time-to-live in seconds for the cached HTTP response.
   * Default: 60 seconds
   */
  ttlSeconds?: number

  /**
   * Custom cache key generator function.
   * Defaults to: `req.originalUrl || req.url`
   */
  keyGenerator?: (req: Request) => string

  /**
   * Predicate to determine if this request should be cached.
   * Defaults to caching GET requests only with status code 200.
   */
  condition?: (req: Request) => boolean

  /**
   * Custom cache instance to use. If omitted, uses the manager passed to the middleware factory.
   */
  cacheManager?: ICacheManager
}

/**
 * Creates an Express HTTP response caching middleware.
 *
 * @example
 * app.get("/api/posts", cacheResponse(cacheManager, { ttlSeconds: 300 }), controller.getPosts)
 */
export function createCacheResponseMiddleware(
  defaultCacheManager: ICacheManager
): (options?: CacheResponseOptions) => RequestHandler {
  return function cacheResponse(options: CacheResponseOptions = {}): RequestHandler {
    const ttlSeconds = options.ttlSeconds ?? 60
    const keyGenerator =
      options.keyGenerator || ((req: Request) => buildCacheKey("http", req.originalUrl || req.url))
    const condition =
      options.condition || ((req: Request) => req.method === "GET")
    const cache = options.cacheManager || defaultCacheManager

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!condition(req)) {
        return next()
      }

      const cacheKey = keyGenerator(req)

      try {
        const cachedPayload = await cache.get<{
          statusCode: number
          headers: Record<string, string | string[] | undefined>
          body: any
        }>(cacheKey)

        if (cachedPayload) {
          res.setHeader("X-Cache", "HIT")
          if (cachedPayload.headers) {
            for (const [headerName, headerValue] of Object.entries(cachedPayload.headers)) {
              if (headerValue !== undefined && headerName !== "x-cache") {
                res.setHeader(headerName, headerValue)
              }
            }
          }
          res.status(cachedPayload.statusCode).send(cachedPayload.body)
          return
        }

        res.setHeader("X-Cache", "MISS")

        // Intercept response .send / .json to cache the output before sending
        const originalSend = res.send.bind(res)
        res.send = function (body: any): Response {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const payload = {
              statusCode: res.statusCode,
              headers: {
                "content-type": res.getHeader("content-type") as string | undefined,
              },
              body,
            }
            cache.set(cacheKey, payload, { ttlSeconds }).catch(() => {})
          }
          return originalSend(body)
        }

        next()
      } catch (error) {
        // Cache read failure shouldn't block the request lifecycle
        res.setHeader("X-Cache", "BYPASS")
        next()
      }
    }
  }
}
