import type { APIRoute } from "astro"

const getRobotsTxt = (sitemapURL: URL) => `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? "https://fiamanillah.com"
  const sitemapURL = new URL("sitemap-index.xml", siteUrl)
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
