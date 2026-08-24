import type { APIRoute } from "astro"
import { webEnv } from "@workspace/env/web"

export const GET: APIRoute = async (context) => {
  const siteUrl = (
    webEnv.PUBLIC_WEB_URL ||
    context.site?.toString() ||
    import.meta.env.PUBLIC_WEB_URL ||
    "https://fi.amanillah.com"
  ).replace(/\/$/, "")

  const nowIso = new Date().toISOString()

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>
</sitemapindex>`

  return new Response(sitemapIndexXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
