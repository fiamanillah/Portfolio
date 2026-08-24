import type { APIRoute } from "astro"
import { webEnv } from "@workspace/env/web"
import {
  getAllBlogPostsAsync,
  getBlogCategoriesAsync,
  getBlogPostPublishedDate,
  getCategorySlug,
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
  const isProd = import.meta.env.PROD || process.env.NODE_ENV === "production"
  const rawSiteUrl =
    import.meta.env.PUBLIC_WEB_URL ||
    context.site?.toString() ||
    process.env.PUBLIC_WEB_URL ||
    webEnv.PUBLIC_WEB_URL ||
    "https://fi.amanillah.com"

  // In production builds, ensure we never emit localhost
  const siteUrl = (
    isProd && rawSiteUrl.includes("localhost")
      ? "https://fi.amanillah.com"
      : rawSiteUrl
  ).replace(/\/$/, "")

  // Fetch real-time published blog posts & case studies directly from DB/API
  const posts = await getAllBlogPostsAsync()
  const categories = await getBlogCategoriesAsync()
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
      loc: `${siteUrl}/resume`,
      lastmod: nowIso,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      loc: `${siteUrl}/profile`,
      lastmod: nowIso,
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${siteUrl}/privacy`,
      lastmod: nowIso,
      changefreq: "monthly",
      priority: "0.5",
    },
    {
      loc: `${siteUrl}/terms`,
      lastmod: nowIso,
      changefreq: "monthly",
      priority: "0.5",
    },
    {
      loc: `${siteUrl}/disclaimer`,
      lastmod: nowIso,
      changefreq: "monthly",
      priority: "0.5",
    },
  ]

  // Dynamic Category Landing & Paginated Routes
  const knownCategorySlugs = new Set<string>()
  const categoryRoutes: string[] = []
  const postsPerPage = 9

  const allCategoryEntries: Array<{ name: string; slug: string }> = []
  for (const cat of categories.filter((c) => c.name.toLowerCase() !== "all")) {
    const slug = getCategorySlug(cat)
    if (!slug || knownCategorySlugs.has(slug)) continue
    knownCategorySlugs.add(slug)
    allCategoryEntries.push({ name: cat.name, slug })
  }

  for (const post of posts) {
    const slug = getCategorySlug(post.categorySlug || post.category)
    if (!slug || knownCategorySlugs.has(slug)) continue
    knownCategorySlugs.add(slug)
    allCategoryEntries.push({ name: post.category, slug })
  }

  for (const catEntry of allCategoryEntries) {
    const matchingCount = posts.filter(
      (p) =>
        p.category.toLowerCase() === catEntry.name.toLowerCase() ||
        getCategorySlug(p.categorySlug || p.category) === catEntry.slug
    ).length

    const catPages = Math.max(1, Math.ceil(matchingCount / postsPerPage))

    // Page 1
    categoryRoutes.push(`  <url>
    <loc>${siteUrl}/blog/category/${catEntry.slug}</loc>
    <lastmod>${latestBlogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`)

    // Additional pages (if any)
    for (let cp = 2; cp <= catPages; cp++) {
      categoryRoutes.push(`  <url>
    <loc>${siteUrl}/blog/category/${catEntry.slug}/${cp}</loc>
    <lastmod>${latestBlogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`)
    }
  }

  // Dynamic Paginated Archive Routes (/blog/page/1, /blog/page/2, ...)
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage))
  const paginationRoutes = Array.from({ length: totalPages }, (_, i) => {
    const pageNum = i + 1
    return `  <url>
    <loc>${siteUrl}/blog/page/${pageNum}</loc>
    <lastmod>${latestBlogDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  // Dynamic Case Studies with live DB/API data & images (Only deep dives have dedicated URLs)
  const caseStudyRoutes = caseStudies
    .filter((study) => study.projectType === "CASE_STUDY" || !study.projectType)
    .map((study) => {
      const studyLastMod = study.updatedAt
        ? new Date(study.updatedAt).toISOString()
        : study.createdAt
          ? new Date(study.createdAt).toISOString()
          : nowIso

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
    <lastmod>${studyLastMod}</lastmod>
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

  const categoryXml = categoryRoutes.join("\n")
  const paginationXml = paginationRoutes.join("\n")
  const caseStudiesXml = caseStudyRoutes.join("\n")
  const blogXml = blogRoutes.join("\n")

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${categoryXml}
${paginationXml}
${caseStudiesXml}
${blogXml}
</urlset>`

  return new Response(sitemapXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
