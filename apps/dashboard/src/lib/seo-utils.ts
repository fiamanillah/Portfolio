// apps/dashboard/src/lib/seo-utils.ts
import type {
  BlogArticleType,
  SeoAnalysisResult,
  SeoHealthCheckItem,
} from "@workspace/shared"

const SITE_URL = "https://fi.amanillah.com"

const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "using",
  "guide",
  "tutorial",
  "build",
  "simple",
])

/**
 * Strip Markdown tags, links, code blocks, images to get clean plain text
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return ""
  return markdown
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // Images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // Bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // Italic
    .replace(/>\s+/g, "") // Blockquotes
    .replace(/[-*+]\s+/g, "") // Lists
    .replace(/\n+/g, " ") // Newlines to spaces
    .trim()
}

const FILLER_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "how",
  "what",
  "why",
  "when",
  "where",
  "who",
  "which",
  "this",
  "that",
  "these",
  "those",
  "your",
  "my",
  "our",
  "its",
  "into",
  "over",
  "after",
])

/**
 * Generate a clean, keyword-dense, SEO-friendly URL slug from article title
 */
export function generateSeoSlug(title: string): string {
  if (!title) return ""

  let text = title
    .trim()
    .toLowerCase()
    // Convert common tech symbols/terms
    .replace(/c\+\+/gi, "cpp")
    .replace(/c#/gi, "csharp")
    .replace(/\.net/gi, "dotnet")
    .replace(/node\.js/gi, "nodejs")
    .replace(/next\.js/gi, "nextjs")
    .replace(/vue\.js/gi, "vuejs")
    .replace(/nuxt\.js/gi, "nuxtjs")
    .replace(/nest\.js/gi, "nestjs")
    .replace(/react\.js/gi, "reactjs")
    .replace(/&/g, "and")
    .replace(/@/g, "at")

  // Remove all non-alphanumeric characters except spaces and hyphens
  text = text.replace(/[^a-z0-9\s-]/g, "")

  // Split into words
  const words = text.split(/[\s-]+/).filter(Boolean)

  // Filter out filler/stop words if we have enough descriptive words remaining (>= 2 words)
  const meaningfulWords = words.filter((w) => !FILLER_WORDS.has(w))
  const selectedWords = meaningfulWords.length >= 2 ? meaningfulWords : words

  // Join with hyphen
  let slug = selectedWords.join("-")

  // Limit length to ~55 chars on word boundary for optimal SERP display
  if (slug.length > 55) {
    const trimmed = slug.slice(0, 55)
    const lastHyphen = trimmed.lastIndexOf("-")
    slug = lastHyphen > 20 ? trimmed.slice(0, lastHyphen) : trimmed
  }

  return slug.replace(/(^-|-$)+/g, "").replace(/--+/g, "-")
}

/**
 * Generate full SEO Canonical URL
 */
export function generateSeoCanonicalUrl(slugOrTitle: string): string {
  const cleanSlug = slugOrTitle.includes("/")
    ? slugOrTitle.split("/").pop() || ""
    : slugOrTitle
  const finalSlug =
    generateSeoSlug(cleanSlug) ||
    cleanSlug.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
  return finalSlug ? `${SITE_URL}/blog/${finalSlug}` : ""
}

/**
 * Auto-generate high-ranking SEO metadata from blog title, summary, and content
 */
export function autoGenerateSeoMetadata(params: {
  title: string
  summary?: string
  content?: string
  slug?: string
}): {
  slug: string
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  articleType: BlogArticleType
} {
  const { title, summary = "", content = "", slug = "" } = params
  const cleanTitle = title.trim()

  // 1. SEO-friendly slug
  const seoSlug = slug.trim() || generateSeoSlug(cleanTitle)

  // 2. Meta Title (Ideal: 45-60 chars, adds branding if fits)
  let metaTitle = cleanTitle
  if (cleanTitle) {
    if (cleanTitle.length <= 44) {
      metaTitle = `${cleanTitle} | Fi Amanillah`
    } else if (cleanTitle.length > 60) {
      metaTitle = cleanTitle.slice(0, 57).trim() + "..."
    }
  }

  // 3. Meta Description (Ideal: 130-155 chars, word-boundary clean trim)
  let metaDescription = ""
  const sourceText = summary.trim() || stripMarkdown(content)
  if (sourceText) {
    if (sourceText.length <= 155) {
      metaDescription = sourceText
    } else {
      const truncated = sourceText.slice(0, 150)
      const lastSpace = truncated.lastIndexOf(" ")
      metaDescription =
        (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated).trim() +
        "..."
    }
  }

  // 4. Canonical URL
  const canonicalUrl = seoSlug ? `${SITE_URL}/blog/${seoSlug}` : ""

  // 5. Article Type Heuristic (TechArticle vs BlogPosting)
  const combinedText = `${cleanTitle} ${summary} ${content}`.toLowerCase()
  const isTechnical =
    content.includes("```") ||
    /architecture|database|api|docker|kubernetes|typescript|react|postgres|redis|backend|frontend/i.test(
      combinedText
    )
  const articleType: BlogArticleType = isTechnical
    ? "TechArticle"
    : "BlogPosting"

  return {
    slug: seoSlug,
    metaTitle,
    metaDescription,
    canonicalUrl,
    articleType,
  }
}

/**
 * Client-Side SEO Real-time Analyzer & Diagnostics
 */
export function calculateClientSeoAnalysis(params: {
  title: string
  summary: string
  content: string
  slug: string
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  coverImage?: string
  tags?: string[]
}): SeoAnalysisResult {
  const {
    title,
    summary,
    content,
    slug,
    metaTitle,
    metaDescription,
    canonicalUrl,
    coverImage,
    tags = [],
  } = params

  const checks: SeoHealthCheckItem[] = []
  let score = 100

  const effTitle =
    metaTitle.trim() || (title ? `${title.trim()} | Fi Amanillah` : "")
  const effDesc =
    metaDescription.trim() ||
    summary.trim() ||
    stripMarkdown(content).slice(0, 150)
  const cleanSlug =
    slug.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  const postUrl = canonicalUrl.trim() || `${SITE_URL}/blog/${cleanSlug}`

  // 1. Meta Title Check
  const titleLen = effTitle.length
  if (titleLen === 0) {
    score -= 30
    checks.push({
      field: "metaTitle",
      level: "fail",
      title: "Missing Meta Title",
      message:
        "No title provided. Search engines require a descriptive <title> tag.",
      recommendation: "Provide a meta title between 40 and 60 characters.",
    })
  } else if (titleLen < 30) {
    score -= 10
    checks.push({
      field: "metaTitle",
      level: "warning",
      title: "Short Meta Title",
      message: `Title length (${titleLen} chars) is below the recommended 40-60 character range.`,
      recommendation:
        "Add primary target keywords or branding to maximize SERP visibility.",
    })
  } else if (titleLen > 65) {
    score -= 10
    checks.push({
      field: "metaTitle",
      level: "warning",
      title: "Long Meta Title",
      message: `Title length (${titleLen} chars) exceeds 60-65 characters and may be truncated on Google SERPs.`,
      recommendation:
        "Trim the title to under 60 characters to avoid ellipsis (...) on search results.",
    })
  } else {
    checks.push({
      field: "metaTitle",
      level: "pass",
      title: "Optimal Title Length",
      message: `Title is ${titleLen} characters, perfect for Google Search and social crawlers.`,
      recommendation:
        "Keep titles descriptive, keyword-rich, and within 40-60 characters.",
    })
  }

  // 2. Meta Description Check
  const descLen = effDesc.length
  if (descLen === 0) {
    score -= 25
    checks.push({
      field: "metaDescription",
      level: "fail",
      title: "Missing Meta Description",
      message:
        "No description provided. Google will generate a generic fallback snippet.",
      recommendation:
        "Write a compelling 120-160 character summary that invites user clicks.",
    })
  } else if (descLen < 80) {
    score -= 10
    checks.push({
      field: "metaDescription",
      level: "warning",
      title: "Short Meta Description",
      message: `Description (${descLen} chars) is too brief. Ideal length is 120-160 characters.`,
      recommendation: "Expand on the key value proposition of the article.",
    })
  } else if (descLen > 165) {
    score -= 8
    checks.push({
      field: "metaDescription",
      level: "warning",
      title: "Long Meta Description",
      message: `Description (${descLen} chars) may be truncated on search result pages.`,
      recommendation: "Condense description to 155 characters or fewer.",
    })
  } else {
    checks.push({
      field: "metaDescription",
      level: "pass",
      title: "Optimal Description Length",
      message: `Description is ${descLen} characters with high CTR potential on SERPs.`,
      recommendation:
        "Maintain concise, active voice summaries with clear value.",
    })
  }

  // 3. Slug Optimization Check
  if (!cleanSlug) {
    score -= 15
    checks.push({
      field: "slug",
      level: "fail",
      title: "Missing URL Slug",
      message: "Post has no URL slug defined.",
      recommendation: "Generate a clean kebab-case URL slug.",
    })
  } else if (/[A-Z_\s]/.test(cleanSlug)) {
    score -= 8
    checks.push({
      field: "slug",
      level: "warning",
      title: "Non-standard URL Slug",
      message: "Slug contains uppercase characters or underscores.",
      recommendation:
        "Use lowercase letters, numbers, and hyphens only for SEO safety.",
    })
  } else {
    checks.push({
      field: "slug",
      level: "pass",
      title: "Clean URL Slug",
      message: `Slug '/blog/${cleanSlug}' is clean, readable, and search engine friendly.`,
      recommendation: "Keep slugs short, descriptive, and keyword-focused.",
    })
  }

  // 4. Content Depth & Word Count
  const words = content.trim().split(/\s+/).filter(Boolean).length
  if (words < 100) {
    score -= 15
    checks.push({
      field: "content",
      level: "warning",
      title: "Thin Article Content",
      message: `Article contains only ~${words} words. Search engines favor comprehensive guides.`,
      recommendation:
        "Aim for at least 300-800 words with thorough technical depth.",
    })
  } else if (words >= 300) {
    checks.push({
      field: "content",
      level: "pass",
      title: "Good Content Depth",
      message: `Article has ~${words} words, meeting indexing depth guidelines.`,
      recommendation:
        "Structure long content with H2 and H3 headings for readability.",
    })
  }

  // 5. Headings Structure Check
  const hasH2 = /^##\s+/m.test(content)
  if (!hasH2 && words > 250) {
    score -= 5
    checks.push({
      field: "headings",
      level: "warning",
      title: "Missing Subheadings (H2)",
      message:
        "Long-form content without H2 subheadings is harder for readers and crawlers to scan.",
      recommendation:
        "Break your content into clear sections using Markdown '##' subheadings.",
    })
  }

  // 6. Cover Artwork / Social Image
  if (!coverImage) {
    score -= 10
    checks.push({
      field: "ogImage",
      level: "warning",
      title: "No Cover Artwork",
      message:
        "No cover image selected. Social shares on X/Twitter and LinkedIn will lack rich media previews.",
      recommendation:
        "Upload a 16:9 1200x630px cover artwork for maximal social engagement.",
    })
  } else {
    checks.push({
      field: "ogImage",
      level: "pass",
      title: "Social Preview Image Present",
      message: "Rich cover image configured for OpenGraph and Twitter cards.",
      recommendation: "Ensure image resolution is at least 1200x630px.",
    })
  }

  // 7. Tags / Taxonomy Check
  if (tags.length === 0) {
    score -= 5
    checks.push({
      field: "tags",
      level: "warning",
      title: "No Tags Assigned",
      message:
        "Tags help organize related topics and strengthen internal linking.",
      recommendation:
        "Add 3-6 topical tags to connect this article with related posts.",
    })
  } else {
    checks.push({
      field: "tags",
      level: "pass",
      title: "Taxonomy & Tags Configured",
      message: `${tags.length} tags assigned for indexing and topic clustering.`,
      recommendation: "Maintain consistent tag naming conventions.",
    })
  }

  const finalScore = Math.max(0, Math.min(100, score))
  const rating: "Excellent" | "Good" | "Needs Improvement" | "Poor" =
    finalScore >= 90
      ? "Excellent"
      : finalScore >= 75
        ? "Good"
        : finalScore >= 50
          ? "Needs Improvement"
          : "Poor"

  return {
    score: finalScore,
    rating,
    checks,
    previews: {
      googleSearchDesktop: {
        title: effTitle,
        url: postUrl,
        description: effDesc,
      },
      googleSearchMobile: {
        title: effTitle,
        url: postUrl,
        description: effDesc,
      },
      twitterCard: {
        card: "summary_large_image",
        title: effTitle,
        description: effDesc,
        image: coverImage || `${SITE_URL}/assets/images/og-default.png`,
        site: "@fiamanillah",
      },
      openGraph: {
        type: "article",
        title: effTitle,
        description: effDesc,
        image: coverImage || `${SITE_URL}/assets/images/og-default.png`,
        url: postUrl,
        siteName: "Fi Amanillah",
      },
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: effTitle,
        description: effDesc,
        image: coverImage || `${SITE_URL}/assets/images/og-default.png`,
        url: postUrl,
        author: {
          "@type": "Person",
          name: "Fi Amanillah",
        },
      },
    },
  }
}
