import React, { useState, useMemo } from "react"
import type { BlogPost } from "@/data/blogPosts"

interface BlogExplorerProps {
  initialPosts: BlogPost[]
  categories: { name: string; count: number }[]
}

export const BlogExplorer: React.FC<BlogExplorerProps> = ({
  initialPosts,
  categories,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const postsPerPage = 6

  // Filter posts by active category
  const filteredPosts = useMemo(() => {
    if (activeCategory.toLowerCase() === "all") {
      return initialPosts
    }
    return initialPosts.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
    )
  }, [initialPosts, activeCategory])

  // Pagination bounds
  const totalCount = filteredPosts.length
  const totalPages = Math.ceil(totalCount / postsPerPage) || 1
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages))

  const paginatedPosts = useMemo(() => {
    const start = (safeCurrentPage - 1) * postsPerPage
    return filteredPosts.slice(start, start + postsPerPage)
  }, [filteredPosts, safeCurrentPage, postsPerPage])

  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const element = document.getElementById("blog-grid-top")
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div id="blog-grid-top" class="w-full">
      {/* Category Filter Navigation Bar */}
      <div class="my-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            FILTER BY CATEGORY:
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive =
              activeCategory.toLowerCase() === cat.name.toLowerCase()
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryChange(cat.name)}
                class={`flex items-center gap-2 border px-3.5 py-1.5 font-mono text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-[0_0_12px_oklch(var(--primary)/15%)]"
                    : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  class={`inline-flex h-4 min-w-[1.25rem] items-center justify-center rounded-sm px-1 font-mono text-[10px] ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid Results Header */}
      <div class="mb-6 flex items-center justify-between">
        <h2 class="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
          // ARTICLES JOURNAL{" "}
          {activeCategory !== "All"
            ? `IN ${activeCategory.toUpperCase()}`
            : ""}
        </h2>
        <span class="font-mono text-xs text-muted-foreground">
          SHOWING{" "}
          {totalCount > 0
            ? `${(safeCurrentPage - 1) * postsPerPage + 1}-${Math.min(
                safeCurrentPage * postsPerPage,
                totalCount
              )}`
            : 0}{" "}
          OF {totalCount} ARTICLES
        </span>
      </div>

      {/* Cards Grid - Default 3 Columns */}
      {paginatedPosts.length > 0 ? (
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <article
              key={post.id}
              class="group relative flex flex-col justify-between overflow-hidden border border-border bg-background/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-background/90 hover:shadow-[0_0_0_1px_oklch(var(--primary)/20%),0_8px_32px_-8px_oklch(var(--primary)/12%)]"
            >
              {/* Corner brackets */}
              <div class="pointer-events-none absolute top-2 left-2 z-20 h-3.5 w-3.5 border-t-[1.5px] border-l-[1.5px] border-border transition-all duration-200 group-hover:h-4.5 group-hover:w-4.5 group-hover:border-primary"></div>
              <div class="pointer-events-none absolute top-2 right-2 z-20 h-3.5 w-3.5 border-t-[1.5px] border-r-[1.5px] border-border transition-all duration-200 group-hover:h-4.5 group-hover:w-4.5 group-hover:border-primary"></div>
              <div class="pointer-events-none absolute bottom-2 left-2 z-20 h-3.5 w-3.5 border-b-[1.5px] border-l-[1.5px] border-border transition-all duration-200 group-hover:h-4.5 group-hover:w-4.5 group-hover:border-primary"></div>
              <div class="pointer-events-none absolute right-2 bottom-2 z-20 h-3.5 w-3.5 border-r-[1.5px] border-b-[1.5px] border-border transition-all duration-200 group-hover:h-4.5 group-hover:w-4.5 group-hover:border-primary"></div>

              <div>
                {/* Thumbnail */}
                <div class="relative aspect-[16/9] w-full overflow-hidden border-b border-border/80 bg-muted/40">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>

                  <div class="absolute top-3 left-3 z-10">
                    <span class="inline-flex items-center rounded-none border border-primary/40 bg-background/80 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary uppercase backdrop-blur-md">
                      {post.category}
                    </span>
                  </div>

                  {post.featured && (
                    <div class="absolute top-3 right-3 z-10">
                      <span class="inline-flex items-center bg-primary px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-primary-foreground uppercase shadow-sm">
                        FEATURED
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div class="p-6">
                  <div class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    <span>{post.date}</span>
                    <span class="text-primary/60">•</span>
                    <span>{post.readTime}</span>
                    {post.views && (
                      <>
                        <span class="text-primary/60">•</span>
                        <span>{post.views} VIEWS</span>
                      </>
                    )}
                  </div>

                  <h3 class="mt-3 text-lg font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary line-clamp-2">
                    <a href={`/blog/${post.slug}`} class="focus:outline-none">
                      <span class="absolute inset-0 z-10" aria-hidden="true"></span>
                      {post.title}
                    </a>
                  </h3>

                  <p class="mt-2.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Tags & Action */}
              <div class="p-6 pt-0">
                <div class="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      class="inline-flex items-center border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/90 transition-colors group-hover:border-primary/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div class="relative z-20 flex items-center justify-between border-t border-border/60 pt-4">
                  <div class="flex items-center gap-2">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        class="h-6 w-6 rounded-full border border-border object-cover"
                      />
                    )}
                    <span class="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                      {post.author.name}
                    </span>
                  </div>

                  <a href={`/blog/${post.slug}`} class="inline-block relative z-20">
                    <button
                      type="button"
                      class="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-3 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                    >
                      Read
                      <span class="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        ↗
                      </span>
                    </button>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div class="my-16 border border-dashed border-border py-12 text-center">
          <p class="font-mono text-sm text-muted-foreground">
            No articles found matching category "{activeCategory}".
          </p>
          <button
            type="button"
            onClick={() => handleCategoryChange("All")}
            class="mt-4 font-mono text-xs text-primary underline cursor-pointer"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <nav
          aria-label="Blog Pagination"
          class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-8 sm:flex-row"
        >
          <div class="font-mono text-xs text-muted-foreground">
            PAGE <span class="font-bold text-foreground">{safeCurrentPage}</span>{" "}
            OF <span class="font-bold text-foreground">{totalPages}</span>
          </div>

          <div class="flex items-center gap-2">
            {/* Prev Button */}
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              class={`border border-border bg-background px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                safeCurrentPage <= 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:border-primary hover:text-primary"
              }`}
            >
              ← Prev
            </button>

            {/* Page Numbers */}
            <div class="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const isCurrent = pageNum === safeCurrentPage
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      class={`h-8 w-8 font-mono text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                }
              )}
            </div>

            {/* Next Button */}
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              class={`border border-border bg-background px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                safeCurrentPage >= totalPages
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:border-primary hover:text-primary"
              }`}
            >
              Next →
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
