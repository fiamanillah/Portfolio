import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import {
  getAllBlogPostsAsync,
  getBlogPostPublishedDate,
} from "@/data/blogPosts"

export const GET: APIRoute = async (context) => {
  const site = (
    context.site?.toString() ||
    import.meta.env.PUBLIC_WEB_URL ||
    "https://fi.amanillah.com"
  ).replace(/\/$/, "")
  const posts = await getAllBlogPostsAsync()

  // Sort posts latest first
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(getBlogPostPublishedDate(a)).getTime()
    const dateB = new Date(getBlogPostPublishedDate(b)).getTime()
    return dateB - dateA
  })

  return rss({
    title: "Fi Amanillah — Technology, AI & Engineering Journal",
    description:
      "Tech stories, AI breakthroughs, semiconductor & hardware market analyses, emerging tech trends, and modern software architecture by Fi Amanillah.",
    site,
    items: sortedPosts.map((post) => ({
      title: post.title,
      description: post.summary,
      pubDate: new Date(getBlogPostPublishedDate(post)),
      link: `/blog/${post.slug}/`,
      categories: [post.category, ...post.tags],
      author: `${post.author.name} (${post.author.role})`,
    })),
    customData: `<language>en-us</language><atom:link href="${site.replace(/\/$/, "")}/rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />`,
  })
}
