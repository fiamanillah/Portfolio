import { Marked } from "marked"
import { createHighlighter, type Highlighter } from "shiki"

export interface TocHeading {
  id: string
  title: string
  depth: number
}

export interface MarkdownRenderResult {
  html: string
  headings: TocHeading[]
}

// Singleton Shiki highlighter instance for fast reuse during static build
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "tokyo-night"],
      langs: [
        "typescript",
        "javascript",
        "jsx",
        "tsx",
        "html",
        "css",
        "scss",
        "astro",
        "vue",
        "svelte",
        "python",
        "rust",
        "go",
        "c",
        "cpp",
        "csharp",
        "java",
        "kotlin",
        "swift",
        "php",
        "ruby",
        "zig",
        "lua",
        "json",
        "jsonc",
        "yaml",
        "toml",
        "xml",
        "sql",
        "prisma",
        "graphql",
        "bash",
        "sh",
        "dockerfile",
        "terraform",
        "nginx",
        "makefile",
        "markdown",
        "mdx",
        "diff",
        "plaintext",
      ],
    })
  }
  return highlighterPromise
}

// Language normalization map
const languageMap: Record<string, string> = {
  ts: "typescript",
  typescript: "typescript",
  js: "javascript",
  javascript: "javascript",
  jsx: "jsx",
  tsx: "tsx",
  mjs: "javascript",
  cjs: "javascript",
  html: "html",
  css: "css",
  scss: "scss",
  astro: "astro",
  svelte: "svelte",
  vue: "vue",
  py: "python",
  python: "python",
  rs: "rust",
  rust: "rust",
  go: "go",
  golang: "go",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  cs: "csharp",
  csharp: "csharp",
  java: "java",
  kt: "kotlin",
  kotlin: "kotlin",
  swift: "swift",
  php: "php",
  rb: "ruby",
  ruby: "ruby",
  zig: "zig",
  lua: "lua",
  json: "json",
  jsonc: "jsonc",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  xml: "xml",
  sql: "sql",
  mysql: "sql",
  postgres: "sql",
  postgresql: "sql",
  prisma: "prisma",
  graphql: "graphql",
  gql: "graphql",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  zsh: "bash",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  "docker-compose": "yaml",
  tf: "terraform",
  terraform: "terraform",
  nginx: "nginx",
  make: "makefile",
  makefile: "makefile",
  md: "markdown",
  markdown: "markdown",
  mdx: "mdx",
  diff: "diff",
  txt: "plaintext",
  plaintext: "plaintext",
  text: "plaintext",
}

const displayLabels: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  astro: "Astro",
  svelte: "Svelte",
  vue: "Vue",
  python: "Python",
  rust: "Rust",
  go: "Go",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  php: "PHP",
  ruby: "Ruby",
  zig: "Zig",
  lua: "Lua",
  json: "JSON",
  jsonc: "JSONC",
  yaml: "YAML",
  toml: "TOML",
  xml: "XML",
  sql: "SQL",
  prisma: "Prisma",
  graphql: "GraphQL",
  bash: "Bash",
  dockerfile: "Dockerfile",
  terraform: "Terraform",
  nginx: "Nginx",
  makefile: "Makefile",
  markdown: "Markdown",
  mdx: "MDX",
  diff: "Diff",
  plaintext: "Plain Text",
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^\w\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Transforms GitHub alert syntax into styled callout blocks
 * e.g., > [!NOTE] or > [!TIP] or > [!WARNING] or > [!IMPORTANT] or > [!CAUTION]
 */
function processCallouts(html: string): string {
  const alertTypes: Record<string, { label: string; icon: string; classModifier: string }> = {
    NOTE: {
      label: "NOTE",
      icon: `<svg class="h-4 w-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      classModifier: "alert-note border-sky-500/30 bg-sky-500/5 text-sky-200",
    },
    TIP: {
      label: "TIP",
      icon: `<svg class="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg>`,
      classModifier: "alert-tip border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
    },
    IMPORTANT: {
      label: "IMPORTANT",
      icon: `<svg class="h-4 w-4 text-violet-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      classModifier: "alert-important border-violet-500/30 bg-violet-500/5 text-violet-200",
    },
    WARNING: {
      label: "WARNING",
      icon: `<svg class="h-4 w-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      classModifier: "alert-warning border-amber-500/30 bg-amber-500/5 text-amber-200",
    },
    CAUTION: {
      label: "CAUTION",
      icon: `<svg class="h-4 w-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      classModifier: "alert-caution border-rose-500/30 bg-rose-500/5 text-rose-200",
    },
  }

  // Regex to match blockquotes containing [!TYPE]
  const blockquoteRegex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?([\s\S]*?)<\/p>\s*([\s\S]*?)<\/blockquote>/gi

  return html.replace(blockquoteRegex, (_match, type, firstLine, rest) => {
    const upperType = type.toUpperCase()
    const config = alertTypes[upperType] || alertTypes.NOTE
    const fullBody = (firstLine.trim() + (rest ? `\n${rest.trim()}` : "")).trim()

    return `
      <div class="my-6 relative overflow-hidden rounded-md border p-4 sm:p-5 backdrop-blur-sm ${config.classModifier}">
        <div class="pointer-events-none absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-current opacity-40"></div>
        <div class="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-current opacity-40"></div>
        <div class="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-current opacity-40"></div>
        <div class="pointer-events-none absolute right-1.5 bottom-1.5 h-2 w-2 border-r border-b border-current opacity-40"></div>
        
        <div class="flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase mb-2">
          ${config.icon}
          <span>// ${config.label}</span>
        </div>
        <div class="text-sm leading-relaxed text-foreground/90 prose-alert-content">
          ${fullBody}
        </div>
      </div>
    `
  })
}

/**
 * Wraps iframes inside responsive 16:9 aspect ratio containers with tech frame decoration
 */
function processIframes(html: string): string {
  // Replace standalone <iframe> tags with responsive styled wrappers
  const iframeRegex = /<iframe([\s\S]*?)<\/iframe>/gi

  return html.replace(iframeRegex, (_match, attrs) => {
    // Extract title if present
    const titleMatch = attrs.match(/title=["']([^"']*)["']/i)
    const title = titleMatch ? titleMatch[1] : "LIVE EMBED / MEDIA"

    // Ensure security attributes
    let updatedAttrs = attrs
    if (!/loading=/i.test(updatedAttrs)) {
      updatedAttrs += ' loading="lazy"'
    }
    if (!/referrerpolicy=/i.test(updatedAttrs)) {
      updatedAttrs += ' referrerpolicy="no-referrer-when-downgrade"'
    }

    return `
      <div class="blog-iframe-container my-8 overflow-hidden rounded-md border border-border/80 bg-card shadow-lg">
        <div class="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2 text-xs font-mono select-none">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-red-500/70 inline-block"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500/70 inline-block"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
            </div>
            <span class="ml-2 font-medium text-foreground/80 flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
              <svg class="h-3.5 w-3.5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span class="truncate">${escapeHtml(title)}</span>
            </span>
          </div>
          <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider border border-primary/20 shrink-0">
            EMBED
          </span>
        </div>
        <div class="relative w-full aspect-video bg-black/40">
          <iframe class="absolute inset-0 h-full w-full border-0" ${updatedAttrs}></iframe>
        </div>
      </div>
    `
  })
}

/**
 * Wraps tables inside responsive horizontal scroll containers
 */
function processTables(html: string): string {
  return html.replace(
    /<table>([\s\S]*?)<\/table>/gi,
    '<div class="blog-table-wrapper my-6 overflow-x-auto rounded-md border border-border/80 bg-card/60 shadow-sm"><table class="w-full text-left text-sm">$1</table></div>'
  )
}

/**
 * Main Markdown Rendering Function
 */
export async function renderMarkdown(content: string): Promise<MarkdownRenderResult> {
  if (!content) {
    return { html: "", headings: [] }
  }

  const highlighter = await getHighlighterInstance()
  const headings: TocHeading[] = []
  const usedSlugs = new Set<string>()

  const markedInstance = new Marked({
    gfm: true,
    breaks: true,
  })

  // Custom renderer for marked
  markedInstance.use({
    renderer: {
      heading({ depth, text }) {
        const rawText = text.replace(/<[^>]*>/g, "").trim()
        const slug = slugify(rawText)

        // Ensure unique slug
        let uniqueSlug = slug
        let counter = 1
        while (usedSlugs.has(uniqueSlug)) {
          uniqueSlug = `${slug}-${counter}`
          counter++
        }
        usedSlugs.add(uniqueSlug)

        // Collect h2 and h3 for Table of Contents
        if (depth === 2 || depth === 3) {
          headings.push({
            id: uniqueSlug,
            title: rawText,
            depth,
          })
        }

        const headingClasses: Record<number, string> = {
          1: "text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-12 mb-6 border-b border-border/60 pb-3",
          2: "text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-10 mb-4 border-b border-border/40 pb-2.5",
          3: "text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-8 mb-3",
          4: "text-lg sm:text-xl font-semibold text-foreground mt-6 mb-2",
          5: "text-base font-semibold text-foreground mt-4 mb-2",
          6: "text-sm font-semibold tracking-wider uppercase text-muted-foreground mt-4 mb-2",
        }

        const tag = `h${depth}`
        const cls = headingClasses[depth] || headingClasses[2]
        const isSection = depth === 2 || depth === 3 ? 'data-article-section=""' : ""

        // Heading with anchor icon on hover
        return `
          <${tag} id="${uniqueSlug}" ${isSection} class="group scroll-mt-28 flex items-center gap-2 ${cls}">
            <a href="#${uniqueSlug}" class="heading-anchor text-muted-foreground/30 hover:text-primary transition-opacity duration-150 no-underline font-mono text-sm" aria-label="Link to section ${escapeHtml(rawText)}">#</a>
            <span>${text}</span>
          </${tag}>
        `
      },

      image({ href, title, text }) {
        const altText = text || ""
        const caption = title || (altText && altText !== href ? altText : "")

        return `
          <figure class="blog-image-figure my-8 overflow-hidden rounded-md border border-border/80 bg-card/60 shadow-md">
            <div class="relative overflow-hidden">
              <img
                src="${escapeHtml(href)}"
                alt="${escapeHtml(altText)}"
                loading="lazy"
                decoding="async"
                class="w-full h-auto object-cover max-h-[550px] transition-transform duration-300 hover:scale-[1.01]"
              />
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent"></div>
            </div>
            ${
              caption
                ? `<figcaption class="border-t border-border/60 bg-muted/30 px-4 py-2.5 text-center font-mono text-xs text-muted-foreground">
                    // ${escapeHtml(caption)}
                  </figcaption>`
                : ""
            }
          </figure>
        `
      },

      code({ text, lang: rawLang = "" }) {
        // Extract language and optional title e.g. ```typescript title="src/api.ts"
        const parts = rawLang.trim().split(/\s+/)
        const langSpec = parts[0] || "plaintext"
        const titleMatch = rawLang.match(/title=["']([^"']+)["']/)
        const title = titleMatch ? titleMatch[1] : parts.length > 1 && !parts[1].startsWith("title=") ? parts[1] : ""

        const normalizedLang = languageMap[langSpec.toLowerCase()] || "plaintext"
        const displayBadge = displayLabels[normalizedLang] || langSpec.toUpperCase() || "CODE"

        let highlightedCode = ""
        try {
          highlightedCode = highlighter.codeToHtml(text, {
            lang: normalizedLang,
            themes: {
              light: "github-light",
              dark: "tokyo-night",
            },
          })
        } catch {
          highlightedCode = `<pre class="astro-code"><code>${escapeHtml(text)}</code></pre>`
        }

        return `
          <div class="code-block-container relative my-6 overflow-hidden rounded-md border shadow-lg">
            <div class="code-header flex items-center justify-between border-b px-4 py-2 text-xs font-mono select-none">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-full bg-red-500/70 inline-block"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-amber-500/70 inline-block"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
                </div>
                ${
                  title
                    ? `<span class="ml-2 font-medium text-foreground/80 flex items-center gap-1.5 truncate max-w-xs">
                        <svg class="h-3.5 w-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span class="truncate">${escapeHtml(title)}</span>
                      </span>`
                    : ""
                }
              </div>

              <div class="flex items-center gap-3">
                <span class="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider border border-primary/20">
                  ${displayBadge}
                </span>
                <button
                  type="button"
                  class="code-copy-btn inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-150 cursor-pointer"
                  data-code="${escapeHtml(text)}"
                  aria-label="Copy code to clipboard"
                >
                  <svg class="copy-icon h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  <svg class="check-icon hidden h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span class="btn-text">Copy</span>
                </button>
              </div>
            </div>

            <div class="code-body-wrapper max-h-[420px] min-h-[50px] overflow-auto text-[13px] leading-relaxed">
              ${highlightedCode}
            </div>
          </div>
        `
      },
    },
  })

  // Parse markdown to HTML
  let parsedHtml = await markedInstance.parse(content)

  // Post-process Callouts, Iframes, and Tables
  parsedHtml = processCallouts(parsedHtml)
  parsedHtml = processIframes(parsedHtml)
  parsedHtml = processTables(parsedHtml)

  return {
    html: parsedHtml,
    headings,
  }
}
