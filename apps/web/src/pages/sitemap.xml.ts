import type { APIRoute } from "astro"
import {
  getAllBlogPostsAsync,
  getBlogPostPublishedDate,
} from "@/data/blogPosts"
import { CaseStudyApi } from "@/lib/api/caseStudyApi"

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export const GET: APIRoute = async (context) => {
  const siteUrl = (
    context.site?.toString() ||
    import.meta.env.PUBLIC_WEB_URL ||
    "https://fi.amanillah.com"
  ).replace(/\/$/, "")

  // Fetch real-time published blog posts & case studies directly from DB/API
  const posts = await getAllBlogPostsAsync()
  const caseStudies = await CaseStudyApi.fetchAllCaseStudies()

  const nowIso = new Date().toISOString()

  // Find latest blog post date for /blog lastmod
  let latestBlogDate = nowIso
  if (posts.length > 0) {
    const sortedDates = posts
      .map((p) =>
        new Date(p.modifiedAt || getBlogPostPublishedDate(p)).getTime()
      )
      .filter((t) => !isNaN(t))
    if (sortedDates.length > 0) {
      latestBlogDate = new Date(Math.max(...sortedDates)).toISOString()
    }
  }

  // Core static & semi-static routes
  const staticRoutes = [
    {
      loc: `${siteUrl}/`,
      lastmod: nowIso,
      changefreq: "daily",
      priority: "1.0",
    },
    {
      loc: `${siteUrl}/blog`,
      lastmod: latestBlogDate,
      changefreq: "daily",
      priority: "0.9",
    },
    {
      loc: `${siteUrl}/case-study`,
      lastmod: nowIso,
      changefreq: "weekly",
      priority: "0.85",
    },
    {
      loc: `${siteUrl}/profile`,
      lastmod: nowIso,
      changefreq: "monthly",
      priority: "0.8",
    },
  ]

  // Dynamic Case Studies with live DB/API data & images (Only deep dives have dedicated URLs)
  const caseStudyRoutes = caseStudies
    .filter((study) => study.projectType === "CASE_STUDY" || !study.projectType)
    .map((study) => {
      let imageTag = ""
      if (study.image) {
        const imgUrl = study.image.startsWith("http")
          ? study.image
          : `${siteUrl}${study.image.startsWith("/") ? "" : "/"}${study.image}`
        imageTag = `\n    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(study.title)}</image:title>
    </image:image>`
      }

      return `  <url>
    <loc>${siteUrl}/case-study/${study.slug}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag}
  </url>`
    })

  // Dynamic Blog Posts with live DB/API data & images
  const blogRoutes = posts.map((post) => {
    const postLastMod = post.modifiedAt
      ? new Date(post.modifiedAt).toISOString()
      : getBlogPostPublishedDate(post)

    let imageTag = ""
    if (post.thumbnail) {
      const imgUrl = post.thumbnail.startsWith("http")
        ? post.thumbnail
        : `${siteUrl}${post.thumbnail.startsWith("/") ? "" : "/"}${post.thumbnail}`
      imageTag = `\n    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>`
    }

    return `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${postLastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${post.featured ? "0.9" : "0.8"}</priority>${imageTag}
  </url>`
  })

  const staticXml = staticRoutes
    .map(
      (route) => `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n")

  const caseStudiesXml = caseStudyRoutes.join("\n")

  const blogXml = blogRoutes.join("\n")

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${caseStudiesXml}
${blogXml}
</urlset>`

  return new Response(sitemapXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
