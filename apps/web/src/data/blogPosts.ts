export interface BlogPost {
  id: string
  slug: string
  title: string
  summary: string
  date: string
  readTime: string
  tags: string[]
  url: string
  featured?: boolean
  views?: string
  author?: {
    name: string
    avatar?: string
  }
}

export const blogPostsData: BlogPost[] = [
  {
    id: "scaling-rabbitmq-redis",
    slug: "scaling-rabbitmq-redis",
    title: "Decoupling Heavy Node.js Jobs with RabbitMQ & Redis",
    summary:
      "A deep dive into architecture patterns for offloading background email queues, AI processing, and webhooks with guaranteed delivery and Redis caching.",
    date: "AUG 2025",
    readTime: "6 MIN READ",
    tags: ["Node.js", "RabbitMQ", "Redis", "Architecture"],
    url: "#",
    featured: true,
  },
  {
    id: "prisma-postgres-optimization",
    slug: "prisma-postgres-optimization",
    title: "Mastering Database Latency with Prisma & PostgreSQL",
    summary:
      "Practical strategies for indexing relational databases, mitigating N+1 query bottlenecks, and configuring connection pooling for production APIs.",
    date: "JUL 2025",
    readTime: "8 MIN READ",
    tags: ["PostgreSQL", "Prisma", "Performance"],
    url: "#",
  },
  {
    id: "realtime-websockets-stripe",
    slug: "realtime-websockets-stripe",
    title: "Building Enterprise Billing Engines with Stripe & WebSockets",
    summary:
      "How to securely process asynchronous webhook events, handle tiered subscription logic, and broadcast instant status changes to clients.",
    date: "JUN 2025",
    readTime: "5 MIN READ",
    tags: ["Stripe", "WebSockets", "TypeScript"],
    url: "#",
  },
]
