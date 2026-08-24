// apps/web/src/middleware.ts
import { defineMiddleware } from "astro:middleware"
import { RedirectApi } from "./lib/api/redirectApi"

// Fast lookup ignore list for static file extensions and system endpoints
const STATIC_EXTENSIONS =
  /\.(png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|mjs|map|txt|xml|json|webmanifest|woff|woff2|ttf|otf|eot)$/i

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)
  const pathname = url.pathname

  // Skip static assets, internal paths, and API routes
  if (
    pathname.startsWith("/_") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/@") ||
    STATIC_EXTENSIONS.test(pathname)
  ) {
    return next()
  }

  // Intercept and resolve incoming route paths against active 301/308 SEO redirection rules
  if (pathname !== "/" && pathname !== "/404") {
    try {
      const redirect = await RedirectApi.resolveRedirect(pathname)
      if (redirect?.redirected && redirect.destination) {
        return context.redirect(
          redirect.destination,
          (redirect.statusCode as any) || 301
        )
      }
    } catch {
      // Continue to next handler if resolution service is unreachable
    }
  }

  return next()
})
