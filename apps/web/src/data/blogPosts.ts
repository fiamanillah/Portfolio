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
    readTime: "12 MIN READ",
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
      "Configure dead-letter exchanges (DLX) for reliable failure recovery and exponential backoff retries.",
      "Implement Redis multi-layer caching to minimize redundant database round-trips under heavy concurrency.",
      "Achieve 99.9% uptime by decoupling backend workers from front-end API gateways.",
    ],
    sections: [
      {
        heading: "Architectural Bottlenecks in Synchronous API Servers",
        body: "When web applications scale, executing compute-intensive tasks—such as PDF generation, video encoding, batch email notifications, or third-party webhook calls—directly within HTTP request-response cycles leads to thread starvation and elevated tail latency (p99). In single-threaded runtimes like Node.js, blocking the main event loop degrades throughput across all concurrent incoming HTTP requests. Decoupling these non-blocking processes into asynchronous background workers is fundamental for production resilience and scaling to millions of daily requests.",
      },
      {
        heading: "Designing Event-Driven Pipelines with RabbitMQ",
        body: "By introducing RabbitMQ as an enterprise AMQP message broker, API endpoints immediately respond to clients with a 202 Accepted status while publishing message payloads into dedicated exchanges. Background consumer workers subscribe to these queues and process tasks independently at their own controlled pace without overwhelming downstream relational databases.",
      },
      {
        heading: "Producer Configuration & Durable Message Queuing",
        body: "To prevent message loss during broker restarts or network partitions, message queues must be declared as durable, and messages marked persistent. Below is an example of an AMQP publisher module configured with connection retry logic and channel management.",
        codeSnippet: {
          language: "typescript",
          code: `import amqp from "amqplib";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function getChannel(): Promise<amqp.Channel> {
  if (channel) return channel;
  
  connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
  channel = await connection.createChannel();

  // Assert dead letter exchange and poison-pill queue
  await channel.assertExchange("dlx_exchange", "direct", { durable: true });
  await channel.assertQueue("dlx_failed_jobs", { durable: true });
  await channel.bindQueue("dlx_failed_jobs", "dlx_exchange", "dlx_failed_jobs");

  return channel;
}

export async function publishTask(queueName: string, payload: object): Promise<boolean> {
  const ch = await getChannel();
  
  await ch.assertQueue(queueName, {
    durable: true,
    deadLetterExchange: "dlx_exchange",
    deadLetterRoutingKey: "dlx_failed_jobs"
  });

  return ch.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true, contentType: "application/json" }
  );
}`,
        },
      },
      {
        heading: "Consumer Worker Pools & Acknowledgment Strategies",
        body: "Consumers receive tasks from RabbitMQ queues and process them asynchronously. Explicit manual acknowledgments (ch.ack) ensure that if a worker process crashes mid-execution, RabbitMQ automatically re-queues the message to be picked up by another healthy worker node.",
        codeSnippet: {
          language: "typescript",
          code: `import { getChannel } from "./publisher";

export async function startWorker(queueName: string, processFn: (data: any) => Promise<void>) {
  const channel = await getChannel();
  await channel.prefetch(10); // Limit unacknowledged messages per worker

  console.log(\`[Worker] Subscribed to queue: \${queueName}\`);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      await processFn(payload);
      channel.ack(msg); // Acknowledge successful processing
    } catch (err) {
      console.error("[Worker Error] Failed processing message:", err);
      // Nack without requeue triggers dead-letter exchange routing
      channel.nack(msg, false, false);
    }
  });
}`,
        },
      },
      {
        heading: "Handling Failures with Dead Letter Exchanges (DLX) & Retry Backoff",
        body: "Network interruptions, database locks, and third-party API rate limits are inevitable in distributed systems. By binding Dead Letter Exchanges (DLX) to main queues, unacknowledged or expired messages are gracefully diverted to failure queues rather than blocking processing pipeline queues.",
      },
      {
        heading: "Multi-Tiered Redis Caching Layer & Stampede Prevention",
        body: "To prevent database stampedes during high-concurrency spikes, Redis functions as a high-performance in-memory caching and locking layer. Domain entities are cached using dynamic TTL expiration alongside mutex distributed locks.",
        codeSnippet: {
          language: "typescript",
          code: `import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Implement basic lock to prevent cache stampedes
  const lockKey = \`lock:\${key}\`;
  const acquiredLock = await redis.set(lockKey, "1", "NX", "EX", 10);

  if (!acquiredLock) {
    // Wait briefly and retry reading from cache
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getOrSetCache(key, fetchFn, ttlSeconds);
  }

  try {
    const freshData = await fetchFn();
    await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
    return freshData;
  } finally {
    await redis.del(lockKey);
  }
}`,
        },
      },
      {
        heading: "Cache Invalidation Strategies & Consistency Guarantees",
        body: "Maintaining consistency between volatile Redis caches and durable PostgreSQL databases requires strict invalidation patterns. Write-through or event-driven cache invalidation (triggered via RabbitMQ domain events) ensures stale reads are eliminated while preserving peak read latency under 5 milliseconds.",
      },
      {
        heading: "Production Monitoring, Grafana Benchmarks & Scaling Guidelines",
        body: "Continuous monitoring of consumer queue length, unacknowledged message count, worker CPU utilization, and Redis cache hit ratios using Prometheus and Grafana dashboards provides early backpressure detection before API response SLAs are compromised.",
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
    readTime: "11 MIN READ",
    category: "WebSockets",
    tags: ["Stripe", "WebSockets", "TypeScript", "Security", "Node.js"],
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
      "Use Socket.io / WebSocket room channels tagged by tenant ID for instant multi-device state updates.",
      "Enforce idempotent database mutations when handling asynchronous billing webhooks.",
      "Implement automatic client-side reconnection strategies with offline queue buffering.",
    ],
    sections: [
      {
        heading: "Architectural Overview of Event-Driven SaaS Billing",
        body: "Modern SaaS billing infrastructure must handle non-linear workflows: trial expirations, seat upgrades, failed recurring charges, dunning cycles, and dynamic prorations. Because Stripe processes transactions asynchronously, relying solely on synchronous API responses yields fragile UI states. Combining cryptographically verified Stripe webhooks with persistent WebSocket channels yields instantaneous UI state updates and sub-second payment confirmation screens.",
      },
      {
        heading: "Cryptographic Webhook Signature Verification & Security Headers",
        body: "Webhook HTTP endpoints exposed to the public internet are prime targets for spoofing and replay attacks. Stripe attaches a custom `stripe-signature` header containing timestamps and HMAC-SHA256 signatures. Verifying this signature against the unparsed raw request body is mandatory before parsing JSON payloads.",
        codeSnippet: {
          language: "typescript",
          code: `import express from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
const router = express.Router();

router.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing Stripe signature header");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Raw Buffer body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(\`[Stripe Webhook Error] Signature verification failed: \${err.message}\`);
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  // Pass event to idempotent processor
  await handleStripeEvent(event);
  res.json({ received: true });
});`,
        },
      },
      {
        heading: "Idempotent Payment Event Processing & Deduplication",
        body: "Network retransmissions can cause Stripe to send identical webhook events multiple times. Processing an event twice could result in double-crediting user account seats or duplicate invoice generation. Persisting processed event IDs (`event.id`) inside an idempotent database table ensures strict single-execution semantics.",
        codeSnippet: {
          language: "typescript",
          code: `import { prisma } from "@workspace/db";
import Stripe from "stripe";

export async function handleStripeEvent(event: Stripe.Event) {
  // Check if event has already been processed
  const existing = await prisma.webhookEvent.findUnique({
    where: { id: event.id }
  });

  if (existing) {
    console.log(\`[Stripe] Skipping already processed event: \${event.id}\`);
    return;
  }

  // Execute processing within isolated database transaction
  await prisma.$transaction(async (tx) => {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await syncTenantSubscription(tx, sub);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(tx, invoice);
        break;
      }
    }

    // Record processed event
    await tx.webhookEvent.create({
      data: { id: event.id, type: event.type, processedAt: new Date() }
    });
  });
}`,
        },
      },
      {
        heading: "Multi-Tenant WebSocket Architecture & Room Allocation",
        body: "To notify active browser tabs immediately when subscription statuses change, WebSocket connections are grouped into secure rooms segmented by tenant ID. When a webhook successfully processes a payment, an internal pub/sub event triggers a broadcast to the tenant's WebSocket channel.",
        codeSnippet: {
          language: "typescript",
          code: `import { Server, Socket } from "socket.io";
import http from "http";

export function initWebSocketServer(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN, credentials: true }
  });

  // Authenticate & join tenant room
  io.use((socket, next) => {
    const tenantId = socket.handshake.auth.tenantId;
    if (!tenantId) return next(new Error("Unauthorized tenant channel"));
    socket.data.tenantId = tenantId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const tenantId = socket.data.tenantId;
    socket.join(\`tenant:\${tenantId}\`);
    console.log(\`[WebSocket] Socket \${socket.id} joined room: tenant:\${tenantId}\`);
  });

  return io;
}`,
        },
      },
      {
        heading: "Real-Time UI State Synchronization & Instant Upgrade Reflections",
        body: "When an administrator upgrades a plan, all active team members viewing the dashboard experience an instant UI transition from 'Free Plan' to 'Enterprise Tier' without reloading the web page, backed by automatic reactive store updates.",
      },
      {
        heading: "Handling Complex Subscription Lifecycles & Proration Logics",
        body: "Managing seat modifications mid-cycle requires computing tier difference prorations via Stripe's Billing API. Webhooks capture `invoice.incoming` events to present accurate billing previews before users confirm seat increases.",
      },
      {
        heading: "Client-Side WebSocket Reconnection & Offline Queue Management",
        body: "Mobile clients and spotty connections require robust reconnection handlers. Buffering pending UI operations in IndexedDB while socket connections are degraded guarantees user intent is preserved when network connectivity returns.",
        codeSnippet: {
          language: "typescript",
          code: `import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on("connect", () => {
  console.log("[WS Client] Connected to real-time billing channel");
});

socket.on("subscription:updated", (payload) => {
  // Update state management store (e.g., Zustand / Pinia)
  useBillingStore.getState().updatePlan(payload);
});`,
        },
      },
      {
        heading: "Rate Limiting Webhook Endpoints & DDoS Protection Strategies",
        body: "Exposing public webhook endpoints demands protective rate limiting. Deploying Cloudflare rules and Nginx rate-limiting zones prevents flood attacks while whitelisting Stripe's official IP range prefixes.",
      },
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
    readTime: "10 MIN READ",
    category: "DevOps",
    tags: ["Docker", "DevOps", "GitHub Actions", "Linux", "CI/CD"],
    thumbnail: "/assets/images/project1.png",
    featured: true,
    views: "1.8k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Containerize backend services with multi-stage Docker builds to minimize final image footprints under 100MB.",
      "Automate deployment SSH triggers through GitHub Actions runner secrets and encrypted environments.",
      "Utilize health check probes in Docker Compose for seamless zero-downtime container updates.",
      "Automate SSL certificate issuance and TLS 1.3 encryption using reverse proxy sidecars.",
    ],
    sections: [
      {
        heading: "Production Infrastructure Overview & VPS Container Architecture",
        body: "Deploying production Node.js applications directly onto bare metal Linux servers often leads to environment drift, dependency conflicts, and unpredictable deployments. Packaging services into isolated Docker containers orchestrated via Docker Compose delivers parity between local development and production VPS environments (such as Hetzner, DigitalOcean, or AWS EC2).",
      },
      {
        heading: "Multi-Stage Dockerfile Optimization for Node.js Microservices",
        body: "Standard Node.js containers often exceed 1GB due to build tools, devDependencies, and raw TypeScript source files. Implementing multi-stage Docker builds creates lean, secure runtime images containing only compiled production JS artifacts.",
        codeSnippet: {
          language: "dockerfile",
          code: `# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json bun.lockb ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

// Copy only necessary production dependencies and dist build
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
        },
      },
      {
        heading: "Structuring Docker Compose for Production Isolation",
        body: "Docker Compose coordinates application containers, PostgreSQL databases, Redis instances, and reverse proxy routing on a shared private network overlay.",
        codeSnippet: {
          language: "yaml",
          code: `version: "3.8"

services:
  app:
    image: ghcr.io/fiamanillah/portfolio-web:latest
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - internal_net

  caddy:
    image: caddy:2-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - internal_net

networks:
  internal_net:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:`,
        },
      },
      {
        heading: "Automated CI/CD Workflows via GitHub Actions & SSH Triggers",
        body: "Commits pushed to the `main` branch trigger a GitHub Actions workflow that executes automated test suites, builds production Docker images, tags them with git commit SHAs, pushes them to GitHub Container Registry (GHCR), and triggers remote deployment via SSH.",
        codeSnippet: {
          language: "yaml",
          code: `name: Deploy Production Pipeline

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/fiamanillah/portfolio-web:latest

      - name: Deploy to VPS over SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.VPS_IP }}
          username: \${{ secrets.VPS_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/portfolio
            docker compose pull app
            docker compose up -d --no-deps app
            docker image prune -f`,
        },
      },
      {
        heading: "Reverse Proxy Setup with Caddy & Automatic TLS/SSL Renewal",
        body: "Caddy reverse proxy automatically provisions and renews Let's Encrypt SSL certificates without requiring manual certbot cron setup. Below is a minimal Caddyfile configuration forwarding traffic to containerized applications.",
        codeSnippet: {
          language: "caddyfile",
          code: `fiamanillah.com {
    encode gzip zstd
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
    }
}`,
        },
      },
      {
        heading: "Environment Secret Vault Integration & Environment Isolation",
        body: "Managing production credentials securely requires injecting secrets at container runtime rather than baking API keys into image layers. Using GitHub Secrets coupled with `.env.production` templates guarantees confidential keys are protected.",
      },
      {
        heading: "Zero-Downtime Rolling Deploys & Health Check Polling",
        body: "Using Docker Compose's `--no-deps` flag combined with health check probes guarantees that incoming HTTP connections are routed to active instances only after new containers pass sanity checks.",
      },
      {
        heading: "Container Log Rotation, Monitoring & Resource Quotas",
        body: "Unbounded Docker logs can quickly consume host disk space. Configuring `json-file` log drivers with `max-size: 10m` limits alongside cgroups memory bounds (`mem_limit: 512m`) preserves host stability under stress.",
      },
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
    readTime: "13 MIN READ",
    category: "Database",
    tags: ["PostgreSQL", "Prisma", "Performance", "SQL", "Database"],
    thumbnail: "/assets/images/moja-cares-cover.png",
    featured: false,
    views: "2.1k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Use composite B-tree and GIN indexes on columns frequently present in WHERE clauses and joins.",
      "Avoid N+1 queries by carefully structuring Prisma include clauses or batching with Promise.all.",
      "Deploy PgBouncer in transaction mode to manage serverless / microservice connections safely.",
      "Leverage raw SQL queries for complex aggregate reports to achieve 10x performance gains.",
    ],
    sections: [
      {
        heading: "Analyzing Database Latency & Prisma ORM Overhead",
        body: "Prisma ORM brings unrivaled TypeScript type safety and developer productivity. However, abstraction layers can hide query generation inefficiency. Understanding how Prisma translates high-level Prisma Client queries into native SQL allows engineers to pinpoint query latency spikes before production database CPU limits are hit.",
      },
      {
        heading: "Eliminating N+1 Query Antipatterns in Relational Models",
        body: "N+1 query issues occur when fetching a collection of N parent records followed by N individual queries to fetch child relationships inside iteration loops. Using explicit Prisma `include` blocks or batching requests reduces execution down to single JOIN operations.",
        codeSnippet: {
          language: "typescript",
          code: `// BAD: N+1 query antipattern
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// GOOD: Single optimized query with join relation
const postsWithAuthors = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true, avatar: true }
    }
  }
});`,
        },
      },
      {
        heading: "Advanced PostgreSQL Indexing Strategies (B-Tree, GIN, & Partial Indexes)",
        body: "Missing database indexes force PostgreSQL engines to perform full sequential table scans (Seq Scans) across millions of rows. Adding targeted B-tree indexes for foreign keys and GIN indexes for JSONB or full-text search fields drops query execution times from seconds to sub-milliseconds.",
        codeSnippet: {
          language: "prisma",
          code: `model Post {
  id        String   @id @default(uuid())
  slug      String   @unique
  categoryId String
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  category  Category @relation(fields: [categoryId], references: [id])

  // Composite index for common filtering & sorting queries
  @@index([categoryId, published, createdAt(sort: Desc)])
  @@index([slug])
}`,
        },
      },
      {
        heading: "High-Performance Raw SQL Escapes & Complex CTE Aggregations",
        body: "While Prisma covers standard CRUD operations, complex analytical dashboards involving recursive Common Table Expressions (CTEs), window functions, or multi-table aggregations are best solved using Prisma's type-safe `$queryRaw` engine escape hatch.",
        codeSnippet: {
          language: "typescript",
          code: `import { prisma } from "@workspace/db";
import { Prisma } from "@prisma/client";

export async function getCategoryMetrics() {
  const metrics = await prisma.$queryRaw<Array<{ category: string; post_count: bigint; avg_views: number }>>\`
    SELECT 
      c.name AS category,
      COUNT(p.id) AS post_count,
      COALESCE(AVG(p.views_count), 0) AS avg_views
    FROM "Category" c
    LEFT JOIN "Post" p ON p."categoryId" = c.id
    WHERE p.published = true
    GROUP BY c.name
    ORDER BY post_count DESC;
  \`;

  return metrics;
}`,
        },
      },
      {
        heading: "Production Connection Pooling with PgBouncer & Serverless Tuning",
        body: "In serverless or highly concurrent container environments, each app instance opening its own connection pool quickly exhausts PostgreSQL connection limits (`max_connections`). Deploying PgBouncer in transaction pooling mode allows thousands of concurrent clients to multiplex over a lean pool of 20-50 physical database connections.",
      },
      {
        heading: "Cursor-Based vs Offset-Based Pagination at Scale",
        body: "Traditional `OFFSET 10000` pagination causes PostgreSQL to scan and discard 10,000 rows prior to returning results. Cursor-based pagination uses indexed unique keys (e.g. `WHERE id > cursor`) to achieve consistent O(1) query performance regardless of page depth.",
        codeSnippet: {
          language: "typescript",
          code: `export async function getPaginatedPosts(cursor?: string, limit = 10) {
  return prisma.post.findMany({
    take: limit + 1, // Fetch extra item to check if next page exists
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // Skip current cursor item
    orderBy: { createdAt: "desc" }
  });
}`,
        },
      },
      {
        heading: "Query Profiling with EXPLAIN ANALYZE & pg_stat_statements",
        body: "Enabling the `pg_stat_statements` extension records total execution time, call frequency, and memory usage per query. Running `EXPLAIN (ANALYZE, BUFFERS)` reveals exact scan costs, hash join allocations, and index hit ratios.",
      },
      {
        heading: "Zero-Downtime Database Migrations in Continuous Delivery Pipelines",
        body: "Applying schema migrations safely in continuous delivery requires non-breaking evolutionary changes: adding nullable columns first, backfilling data asynchronously, and dropping deprecated columns in subsequent release deployments.",
      },
    ],
  },
  {
    id: "rest-api-security-best-practices",
    slug: "rest-api-security-best-practices",
    title: "Hardening REST APIs: RBAC, Rate Limiting & Anti-Spam",
    subtitle: "Protecting Node.js APIs against brute force, bot submissions, and unauthorized escalation",
    summary:
      "A comprehensive security guide detailing JWT token rotation, rate-limiting middleware, honeypot inputs, turnstile verification, and role-based access control (RBAC).",
    date: "APR 2025",
    readTime: "12 MIN READ",
    category: "Security",
    tags: ["Security", "Node.js", "Express", "API", "Auth"],
    thumbnail: "/assets/images/moja-cares-insights.png",
    featured: false,
    views: "3.2k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Implement zero-trust auth with short-lived JWT access tokens and HTTP-only refresh cookies.",
      "Enforce granular Role-Based Access Control (RBAC) middleware on sensitive API endpoints.",
      "Utilize Redis sliding-window rate limiting to prevent brute-force credential stuffing.",
      "Integrate Cloudflare Turnstile and honeypot field validation to block automated bot submissions.",
    ],
    sections: [
      {
        heading: "Modern Threat Landscapes & Defense-in-Depth Strategy",
        body: "Publicly accessible HTTP REST APIs are continuously scanned by automated botnets for unpatched vulnerabilities, credential stuffing exploits, and broken object-level authorization (BOLA/IDOR). Adopting a defense-in-depth architecture ensures that even if one protection layer fails, downstream resources remain strictly safeguarded.",
      },
      {
        heading: "Zero-Trust JWT Authentication & Double-Submit Refresh Tokens",
        body: "Storing access tokens in browser local storage leaves applications vulnerable to Cross-Site Scripting (XSS) token theft. Issuing short-lived JWTs (15 min expiry) alongside HTTP-only, SameSite=Strict refresh cookies provides robust session management.",
        codeSnippet: {
          language: "typescript",
          code: `import jwt from "jsonwebtoken";
import { Response } from "express";

export function issueTokens(res: Response, user: { id: string; role: string }) {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  // Set HTTP-only secure cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return { accessToken };
}`,
        },
      },
      {
        heading: "Fine-Grained Role-Based Access Control (RBAC) Middleware",
        body: "Declarative RBAC middleware verifies user permissions prior to routing requests to controller logic, preventing unauthorized privilege escalation.",
        codeSnippet: {
          language: "typescript",
          code: `import { Request, Response, NextFunction } from "express";

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role; // Set by auth middleware

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden: Insufficient security privileges"
      });
    }

    next();
  };
}`,
        },
      },
      {
        heading: "Distributed Sliding-Window Rate Limiting with Redis",
        body: "Fixed-window rate limiters suffer from burst spikes around window reset boundaries. Implementing sliding-window log algorithms in Redis tracks exact request timestamps per IP address to provide smooth traffic control.",
        codeSnippet: {
          language: "typescript",
          code: `import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";

const redis = new Redis(process.env.REDIS_URL!);

export function rateLimiter(maxRequests = 100, windowSeconds = 60) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = \`rate_limit:\${ip}\`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Remove expired entries & add current request
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, now.toString());
    pipeline.zcard(key);
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();
    const requestCount = results?.[2]?.[1] as number;

    if (requestCount > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    next();
  };
}`,
        },
      },
      {
        heading: "Multi-Layer Anti-Spam (Cloudflare Turnstile & Honeypot Fields)",
        body: "Public contact and subscription forms are constantly targeted by automated submission bots. Combining Cloudflare Turnstile token validation with hidden honeypot fields silently discards spam submissions without burdening legitimate users with interactive CAPTCHAs.",
        codeSnippet: {
          language: "typescript",
          code: `export async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
  formData.append("response", token);
  formData.append("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  });

  const outcome = await res.json();
  return outcome.success === true;
}`,
        },
      },
      {
        heading: "Input Validation & Sanitization with Zod Schema Enforcement",
        body: "Untrusted incoming HTTP request bodies can cause SQL injections, NoSQL operator injections, or unhandled runtime crashes. Validating every request body against strict Zod schemas ensures data matches expected types.",
        codeSnippet: {
          language: "typescript",
          code: `import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  website_hp: z.string().max(0, "Bot submission detected") // Honeypot field
});`,
        },
      },
      {
        heading: "Security Headers & CORS Policy Hardening with Helmet",
        body: "Using Helmet middleware enforces critical HTTP headers: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (clickjacking protection), and X-Content-Type-Options.",
      },
      {
        heading: "Audit Logging, Anomaly Detection & Incident Response Playbooks",
        body: "Centralizing structured JSON security logs containing user IDs, IP addresses, request paths, and execution times into SIEM systems enables automated alerting on brute-force attempts and anomalous data access.",
      },
    ],
  },
  {
    id: "typescript-monorepo-turbo",
    slug: "typescript-monorepo-turbo",
    title: "Building Scalable Monorepos with Turborepo & Bun",
    subtitle: "Structuring shared packages, UI design systems, and cross-application code reuse",
    summary:
      "Learn how to manage multi-app repositories with Turborepo, sharing UI component libraries, database schemas, and shared utilities across Next.js, Astro, and Express apps.",
    date: "MAR 2025",
    readTime: "11 MIN READ",
    category: "Architecture",
    tags: ["TypeScript", "Turborepo", "Bun", "Monorepo", "Architecture"],
    thumbnail: "/assets/images/project2.png",
    featured: false,
    views: "2.5k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Organize apps and reusable packages cleanly using pnpm or Bun workspace protocols.",
      "Share tailwind CSS design systems and React / Astro components seamlessly across apps.",
      "Configure Turborepo pipelines for cached zero-config builds and rapid incremental testing.",
      "Decouple database ORM logic into a standalone `@workspace/db` internal package.",
    ],
    sections: [
      {
        heading: "Monorepo Architecture: Why Turborepo & Bun?",
        body: "As software teams grow, maintaining separate repositories for web frontends, backend APIs, design systems, and shared TypeScript types leads to code duplication and version synchronization friction. A unified monorepo powered by Turborepo and Bun enables atomic cross-project commits, shared tooling configurations, and lightning-fast build caching.",
      },
      {
        heading: "Workspace Directory Layout & Package Dependency Management",
        body: "A clean monorepo separates application entry points from shared internal packages. Internal packages use the `workspace:*` dependency protocol to reference local packages directly without publishing to public NPM registries.",
        codeSnippet: {
          language: "json",
          code: `// Root package.json
{
  "name": "portfolio-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}`,
        },
      },
      {
        heading: "Decoupling Shared UI Design Systems & Tailwind Configs",
        body: "Extracting shared UI components (buttons, badges, inputs, dialogs) into `@workspace/ui` ensures consistent design tokens and atomic styling across Next.js dashboards and Astro landing pages.",
        codeSnippet: {
          language: "typescript",
          code: `// packages/ui/src/components/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div class={badgeVariants({ variant })} {...props} />;
}`,
        },
      },
      {
        heading: "Extracting Database Schemas & Shared Prisma Client Package",
        body: "Housing Prisma schema definitions and client instantiations in `@workspace/db` allows backend Express servers, Astro SSR pages, and CLI scripts to import identical database types natively.",
        codeSnippet: {
          language: "typescript",
          code: `// packages/db/src/index.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";`,
        },
      },
      {
        heading: "Configuring Turborepo Task Graph Pipelines & Caching Rules",
        body: "Turborepo uses DAG (Directed Acyclic Graph) task definitions in `turbo.json` to execute tasks in optimal topological order. Unchanged build outputs are restored instantly from local or remote build caches.",
        codeSnippet: {
          language: "json",
          code: `{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}`,
        },
      },
      {
        heading: "Accelerating Builds with Bun & Workspace Protocol",
        body: "Leveraging Bun as the package installer and script executor cuts package installation times down to sub-seconds while offering native TypeScript execution without transpilation steps.",
      },
      {
        heading: "CI/CD Optimization: Incremental Builds & Remote Caching setup",
        body: "Connecting Turborepo to remote cache storage ensures CI runners bypass building untouched apps, cutting deployment build pipeline durations by over 70%.",
      },
      {
        heading: "Developer Experience: Monorepo Scripts & Automated Versioning",
        body: "Utilizing Changesets simplifies versioning and changelog generation across monorepo workspace packages prior to deployment releases.",
      },
    ],
  },
  {
    id: "distributed-tracing-opentelemetry",
    slug: "distributed-tracing-opentelemetry",
    title: "Architecting Distributed Tracing with OpenTelemetry & Jaeger",
    subtitle: "End-to-end trace context propagation across asynchronous microservices",
    summary:
      "How to instrument Express, RabbitMQ, and Prisma with OpenTelemetry trace contexts to visualize request journeys and diagnose latency bottlenecks in complex distributed environments.",
    date: "FEB 2025",
    readTime: "11 MIN READ",
    category: "Architecture",
    tags: ["OpenTelemetry", "Jaeger", "Tracing", "Microservices", "Observability"],
    thumbnail: "/assets/images/project3.png",
    featured: false,
    views: "1.1k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Propagate W3C Trace Context headers across HTTP requests and RabbitMQ AMQP message headers.",
      "Auto-instrument Express middleware, Prisma ORM, and Redis calls with OpenTelemetry SDKs.",
      "Export trace spans to Jaeger UI for intuitive visual latency breakdown and bottleneck diagnosis.",
      "Correlate application logs with trace ID and span ID fields for unified root-cause debugging.",
    ],
    sections: [
      {
        heading: "Observability Triad: Metrics, Logs, & Distributed Traces",
        body: "In monolithic applications, debugging request failures involves checking server log files. In microservice architectures—where an API request traverses gateways, message queues, worker processes, and database clusters—finding the exact cause of a 500ms delay requires distributed tracing. OpenTelemetry provides a vendor-neutral standard for capturing end-to-end trace context across service boundaries.",
      },
      {
        heading: "OpenTelemetry Core Architecture & Span Context Propagation",
        body: "A trace represents a single user transaction flowing through a system. A trace contains multiple spans, where each span measures the execution timeframe of an individual component (e.g. an HTTP handler, database query, or RabbitMQ publication). W3C TraceContext headers (`traceparent`) allow child spans to link back to parent trace IDs.",
      },
      {
        heading: "Instrumenting Express & Node.js Microservices",
        body: "Initializing the OpenTelemetry SDK before importing application modules enables automatic monkey-patching of Node.js core modules (`http`, `https`) and popular libraries.",
        codeSnippet: {
          language: "typescript",
          code: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

const sdk = new NodeSDK({
  serviceName: "portfolio-api-service",
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "grpc://localhost:4317"
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false }
    })
  ]
});

sdk.start();
console.log("[Tracing] OpenTelemetry SDK initialized");`,
        },
      },
      {
        heading: "Injecting Trace Context across RabbitMQ AMQP Headers",
        body: "When publishing job payloads to RabbitMQ, trace contexts must be explicitly injected into message headers so downstream queue workers continue the parent trace context rather than starting disconnected traces.",
        codeSnippet: {
          language: "typescript",
          code: `import { propagation, context } from "@opentelemetry/api";

export function publishTracedMessage(channel: any, queue: string, message: object) {
  const headers: Record<string, string> = {};

  // Inject current active trace context into headers object
  propagation.inject(context.active(), headers);

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    { headers, persistent: true }
  );
}`,
        },
      },
      {
        heading: "Database Instrumentation for Prisma & PostgreSQL Queries",
        body: "Configuring the `@prisma/instrumentation` plugin exposes individual SQL query execution times, connection pool wait durations, and transaction boundaries directly inside trace waterfalls.",
      },
      {
        heading: "Deploying Jaeger Collector & OpenTelemetry Collector Agent",
        body: "OpenTelemetry Collectors receive traces via gRPC, aggregate span buffers, apply head-based sampling strategies, and forward trace datasets into Jaeger UI for visual analysis.",
        codeSnippet: {
          language: "yaml",
          code: `version: "3.8"
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # Web UI
      - "4317:4317"   # OTLP gRPC port
    environment:
      - COLLECTOR_OTLP_ENABLED=true`,
        },
      },
      {
        heading: "Correlating JSON Log Entries with Active Trace & Span IDs",
        body: "Injecting `{ traceId, spanId }` metadata into structured Pino / Winston log outputs allows developers inspecting log search tools (e.g. Grafana Loki) to jump directly into corresponding Jaeger trace timelines with a single click.",
      },
      {
        heading: "Latency Waterfall Analysis & Automated Alerting on Trace Anomalies",
        body: "Analyzing trace waterfalls identifies long tail latency issues such as sequential un-batched database queries, slow DNS lookups, or delayed consumer acknowledgments before end-user experience degrades.",
      },
    ],
  },
  {
    id: "cicd-artifact-signing-security",
    slug: "cicd-artifact-signing-security",
    title: "CI/CD Security: Signing Container Artifacts & Automated Scans",
    subtitle: "Preventing supply chain attacks with Cosign, Trivy vulnerability scans, and secret detection",
    summary:
      "Comprehensive DevOps security pipeline setup for signing OCI container images, detecting hardcoded secrets in pull requests, and scanning dependencies for CVE vulnerabilities.",
    date: "JAN 2025",
    readTime: "12 MIN READ",
    category: "Security",
    tags: ["Security", "DevOps", "Cosign", "Docker", "CI/CD"],
    thumbnail: "/assets/images/project444.png",
    featured: false,
    views: "1.9k",
    author: {
      name: "Fi Amanillah",
      role: "Full Stack & DevOps Engineer",
      avatar: "/fi.png",
    },
    keyTakeaways: [
      "Sign container images keylessly using Sigstore Cosign and OIDC GitHub tokens.",
      "Automate vulnerability scanning in CI pipelines using Aqua Security Trivy.",
      "Block committed API keys and credentials using Gitleaks pre-commit scanning.",
      "Generate Software Bill of Materials (SBOM) in SPDX format with Syft.",
    ],
    sections: [
      {
        heading: "Software Supply Chain Risks & Attestation Frameworks",
        body: "Recent high-profile security incidents have shown that software supply chains are prime targets for malicious actors. Attackers compromise third-party dependencies, hijack CI runners, or inject malicious code into unsigned container images. Adopting SLSA (Supply-chain Levels for Software Artifacts) security standards guarantees artifact authenticity and origin integrity.",
      },
      {
        heading: "Keyless Cryptographic Container Signing with Sigstore Cosign",
        body: "Traditional container signing required managing vulnerable long-lived private PGP keys. Sigstore Cosign enables keyless signing by leveraging short-lived OIDC identity tokens provided natively by GitHub Actions runners and recording signatures in the Rekor public transparency log.",
        codeSnippet: {
          language: "yaml",
          code: `- name: Install Cosign
  uses: sigstore/cosign-installer@v3.3.0

- name: Sign Container Image (Keyless)
  env:
    TAGS: ghcr.io/fiamanillah/portfolio-web:latest
    COSIGN_EXPERIMENTAL: "1"
  run: |
    cosign sign --yes \${TAGS}`,
        },
      },
      {
        heading: "Automated Image Vulnerability Scanning with Trivy in CI/CD",
        body: "Scanning container filesystem layers and OS packages with Trivy before publishing guarantees that containers with HIGH or CRITICAL CVE vulnerabilities are blocked before reaching production.",
        codeSnippet: {
          language: "yaml",
          code: `- name: Run Trivy Vulnerability Scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ghcr.io/fiamanillah/portfolio-web:latest'
    format: 'table'
    exit-code: '1' # Fail pipeline if severe vulnerabilities exist
    ignore-unfixed: true
    vuln-type: 'os,library'
    severity: 'CRITICAL,HIGH'`,
        },
      },
      {
        heading: "Preventing Hardcoded Secret Leaks with Gitleaks & Pre-commit Hooks",
        body: "Accidentally committing AWS secrets, Stripe API keys, or private SSH keys to public GitHub repositories leads to instant exploitation by automated scanners. Integrating Gitleaks into local pre-commit hooks and pull request workflows catches leaked credentials prior to commit pushes.",
        codeSnippet: {
          language: "bash",
          code: `# Run Gitleaks locally to audit repository history
gitleaks detect --source . --verbose --config .gitleaks.toml`,
        },
      },
      {
        heading: "Generating & Verifying Software Bill of Materials (SBOM) with Syft",
        body: "A Software Bill of Materials (SBOM) provides a complete nested inventory of every open-source library, runtime dependency, and OS binary included inside a release container. Generating SBOMs with Syft ensures compliance transparency.",
        codeSnippet: {
          language: "bash",
          code: `# Generate SPDX-JSON formatted SBOM
syft ghcr.io/fiamanillah/portfolio-web:latest -o spdx-json=sbom.spdx.json`,
        },
      },
      {
        heading: "Runtime Policy Enforcement with Kyverno & Kubernetes Admission Controllers",
        body: "Signing images is effective only if Kubernetes or Docker hosts reject unsigned images at deploy time. Admission controllers automatically verify Cosign signatures on image deployment payloads.",
      },
      {
        heading: "Enforcing Signed Artifact Attestations in Production Clusters",
        body: "Attestation policies require images to pass both Cosign signature validation and Trivy vulnerability threshold attestations before deployment pods are scheduled.",
      },
      {
        heading: "Continuous Compliance Auditing & Security Posture Dashboards",
        body: "Aggregating SBOM manifests, vulnerability scan logs, and image signatures into centralized security dashboards maintains continuous audit readiness.",
      },
    ],
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

export function getAdjacentBlogPosts(slug: string): {
  prevPost: BlogPost | null
  nextPost: BlogPost | null
} {
  const index = blogPostsData.findIndex((p) => p.slug === slug)
  if (index === -1) return { prevPost: null, nextPost: null }
  return {
    prevPost: index > 0 ? blogPostsData[index - 1] : null,
    nextPost: index < blogPostsData.length - 1 ? blogPostsData[index + 1] : null,
  }
}
