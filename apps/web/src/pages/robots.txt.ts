import type { APIRoute } from "astro"

const getRobotsTxt = (sitemapURL: URL, siteUrl: string) => `\
User-agent: *
Allow: /
Disallow: /api/
Disallow: /test/
Disallow: /text/

# Host and Sitemaps
Host: ${new URL(siteUrl).host}
Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (
    site?.toString() ||
    import.meta.env.PUBLIC_WEB_URL ||
    "https://fi.amanillah.com"
  ).replace(/\/$/, "")
  const sitemapURL = new URL("sitemap-index.xml", siteUrl)
  return new Response(getRobotsTxt(sitemapURL, siteUrl), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
