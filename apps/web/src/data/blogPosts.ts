export interface BlogAuthor {
  name: string
  role: string
  avatar: string
}

export interface BlogContentSection {
  heading: string
  body: string
  codeSnippet?: {
    language: string
    code: string
  }
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  summary: string
  date: string
  readTime: string
  category: "Architecture" | "Database" | "Performance" | "WebSockets" | "DevOps" | "Security"
  tags: string[]
  thumbnail: string
  featured?: boolean
  views?: string
  author: BlogAuthor
  keyTakeaways?: string[]
  sections?: BlogContentSection[]
}

export const blogPostsData: BlogPost[] = [
  {
    id: "scaling-rabbitmq-redis",
    slug: "scaling-rabbitmq-redis",
    title: "Decoupling Heavy Node.js Jobs with RabbitMQ & Redis",
    subtitle: "Architecting high-throughput background processing pipelines for asynchronous tasks",
    summary:
      "A deep dive into architecture patterns for offloading background email queues, AI processing, and webhook dispatching with guaranteed delivery, dead-letter queues, and Redis caching.",
    date: "AUG 2025",
    readTime: "6 MIN READ",
    category: "Architecture",
    tags: ["Node.js", "RabbitMQ", "Redis", "Architecture", "Microservices"],
    thumbnail: "/assets/images/mickanic-cover.png",
    featured: true,
    views: "1.4k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Decouple intensive CPU tasks from HTTP event loops using AMQP message queues.",
      "Configure dead-letter exchanges (DLX) for reliable failure recovery and retries.",
      "Implement Redis multi-layer caching to minimize redundant database round-trips under heavy concurrency.",
    ],
    sections: [
      {
        heading: "The Problem: Synchronous Bottlenecks in API Servers",
        body: "When web applications scale, performing heavy tasks—such as generating PDF invoices, encoding media, or dispatching external Webhook notifications—directly inside the request-response cycle leads to thread starvation and elevated tail latency.",
      },
      {
        heading: "Designing the Event-Driven Message Queue with RabbitMQ",
        body: "By introducing RabbitMQ as an asynchronous message broker, API endpoints can immediately return a 202 Accepted response after publishing payload events to an exchange.",
      },
    ],
  },
  {
    id: "realtime-websockets-stripe",
    slug: "realtime-websockets-stripe",
    title: "Building Enterprise Billing Engines with Stripe & WebSockets",
    subtitle: "Handling seat-based billing, webhook signature verification, and instant UI state synchronization",
    summary:
      "How to securely process asynchronous webhook events, handle tiered subscription logic, guard against replay attacks, and broadcast instant state updates to client frontends seamlessly.",
    date: "JUN 2025",
    readTime: "5 MIN READ",
    category: "WebSockets",
    tags: ["Stripe", "WebSockets", "TypeScript", "Security"],
    thumbnail: "/assets/images/mickanic-billing.png",
    featured: true,
    views: "980",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Verify raw request signatures on Stripe webhook endpoints to prevent tampered payloads.",
      "Use Socket.io/WebSocket rooms tagged by tenant ID for real-time client notifications.",
      "Maintain idempotent database mutations when processing payment events.",
    ],
  },
  {
    id: "docker-vps-cicd-deployment",
    slug: "docker-vps-cicd-deployment",
    title: "Automated VPS Deployments with Docker Compose & GitHub Actions",
    subtitle: "Zero-downtime production deployment workflow for multi-container microservices",
    summary:
      "Step-by-step guide to setting up automated CI/CD pipelines, SSL certificate renewal via Caddy/Nginx, environment secret management, and zero-downtime container updates on Linux VPS.",
    date: "MAY 2025",
    readTime: "7 MIN READ",
    category: "DevOps",
    tags: ["Docker", "DevOps", "GitHub Actions", "Linux"],
    thumbnail: "/assets/images/project1.png",
    featured: true,
    views: "1.8k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Containerize backend services with multi-stage Docker builds to minimize final image size.",
      "Automate deployment SSH triggers through GitHub Actions runner secrets.",
      "Utilize health checks in Docker Compose for rolling service updates.",
    ],
  },
  {
    id: "prisma-postgres-optimization",
    slug: "prisma-postgres-optimization",
    title: "Mastering Database Latency with Prisma & PostgreSQL",
    subtitle: "Eliminating query bottlenecks, N+1 issues, and connection pool exhaustion",
    summary:
      "Practical strategies for indexing relational databases, mitigating N+1 query bottlenecks, leveraging raw SQL when needed, and configuring PgBouncer connection pooling for production APIs.",
    date: "JUL 2025",
    readTime: "8 MIN READ",
    category: "Database",
    tags: ["PostgreSQL", "Prisma", "Performance", "SQL"],
    thumbnail: "/assets/images/moja-cares-cover.png",
    featured: false,
    views: "2.1k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
  },
  {
    id: "rest-api-security-best-practices",
    slug: "rest-api-security-best-practices",
    title: "Hardening REST APIs: RBAC, Rate Limiting & Anti-Spam",
    subtitle: "Protecting Node.js APIs against brute force, bot submissions, and unauthorized escalation",
    summary:
      "A comprehensive security guide detailing JWT token rotation, rate-limiting middleware, honeypot inputs, turnstile verification, and role-based access control (RBAC).",
    date: "APR 2025",
    readTime: "9 MIN READ",
    category: "Security",
    tags: ["Security", "Node.js", "Express", "API"],
    thumbnail: "/assets/images/moja-cares-insights.png",
    featured: false,
    views: "3.2k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
  },
  {
    id: "typescript-monorepo-turbo",
    slug: "typescript-monorepo-turbo",
    title: "Building Scalable Monorepos with Turborepo & Bun",
    subtitle: "Structuring shared packages, UI design systems, and cross-application code reuse",
    summary:
      "Learn how to manage multi-app repositories with Turborepo, sharing UI component libraries, database schemas, and shared utilities across Next.js, Astro, and Express apps.",
    date: "MAR 2025",
    readTime: "6 MIN READ",
    category: "Architecture",
    tags: ["TypeScript", "Turborepo", "Bun", "Monorepo"],
    thumbnail: "/assets/images/project2.png",
    featured: false,
    views: "2.5k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
  },
  {
    id: "distributed-tracing-opentelemetry",
    slug: "distributed-tracing-opentelemetry",
    title: "Architecting Distributed Tracing with OpenTelemetry & Jaeger",
    subtitle: "End-to-end trace context propagation across asynchronous microservices",
    summary:
      "How to instrument Express, RabbitMQ, and Prisma with OpenTelemetry trace contexts to visualize request journeys and diagnose latency bottlenecks in complex distributed environments.",
    date: "FEB 2025",
    readTime: "7 MIN READ",
    category: "Architecture",
    tags: ["OpenTelemetry", "Jaeger", "Tracing", "Microservices"],
    thumbnail: "/assets/images/project3.png",
    featured: false,
    views: "1.1k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
  },
  {
    id: "cicd-artifact-signing-security",
    slug: "cicd-artifact-signing-security",
    title: "CI/CD Security: Signing Container Artifacts & Automated Scans",
    subtitle: "Preventing supply chain attacks with Cosign, Trivy vulnerability scans, and secret detection",
    summary:
      "Comprehensive DevOps security pipeline setup for signing OCI container images, detecting hardcoded secrets in pull requests, and scanning dependencies for CVE vulnerabilities.",
    date: "JAN 2025",
    readTime: "8 MIN READ",
    category: "Security",
    tags: ["Security", "DevOps", "Cosign", "Docker"],
    thumbnail: "/assets/images/project444.png",
    featured: false,
    views: "1.9k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
  },
]

// Utility Functions
export function getAllBlogPosts(): BlogPost[] {
  return blogPostsData
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPostsData.filter((post) => post.featured)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsData.find((post) => post.slug === slug)
}

export function getBlogCategories(): { name: string; count: number }[] {
  const categoriesMap = new Map<string, number>()
  blogPostsData.forEach((post) => {
    const current = categoriesMap.get(post.category) || 0
    categoriesMap.set(post.category, current + 1)
  })

  const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
    name,
    count,
  }))

  return [{ name: "All", count: blogPostsData.length }, ...categories]
}

export function getPaginatedBlogPosts(
  page: number = 1,
  limit: number = 4,
  category: string = "All"
) {
  let posts = blogPostsData
  if (category && category !== "All") {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  }

  const totalCount = posts.length
  const totalPages = Math.ceil(totalCount / limit) || 1
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * limit
  const paginatedPosts = posts.slice(startIndex, startIndex + limit)

  return {
    posts: paginatedPosts,
    totalCount,
    totalPages,
    currentPage,
  }
}
