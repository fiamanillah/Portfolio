import type { APIRoute } from "astro"

const getRobotsTxt = (siteUrl: string) => `\
User-agent: *
Allow: /
Disallow: /api/
Disallow: /test/
Disallow: /text/
Disallow: /unsubscribe

# Host and Sitemaps
Host: ${new URL(siteUrl).host}
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap-index.xml
`

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (
    site?.toString() ||
    import.meta.env.PUBLIC_WEB_URL ||
    "https://fi.amanillah.com"
  ).replace(/\/$/, "")
  return new Response(getRobotsTxt(siteUrl), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
