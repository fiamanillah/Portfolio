import { prisma, Role, ExperienceStatus } from "../src/index";

async function main() {
  console.log("🌱 Seeding database...");

  const defaultPasswordHash = await Bun.password.hash("change-me-immediately", {
    algorithm: "bcrypt",
    cost: 10,
  });

  const demoPasswordHash = await Bun.password.hash("password123", {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 1. Seed Admin User: Fi Amanillah
  const adminUser = await prisma.user.upsert({
    where: { email: "fi@amanillah.dev" },
    update: {
      name: "Fi Amanillah",
      username: "fiamanillah",
      role: Role.ADMIN,
      headline: "Author & Lead Architect",
      badge: "Author",
      bio: "Full Stack & DevOps Engineer building high-throughput distributed systems.",
      location: "Singapore / Remote",
      website: "https://amanillah.dev",
      githubUrl: "https://github.com/fiamanillah",
      twitterUrl: "https://twitter.com/fiamanillah",
      linkedinUrl: "https://linkedin.com/in/fiamanillah",
      pronouns: "he/him",
      customStatus: "⚡ Optimizing distributed queues",
      avatar: "/fi.png",
      isEmailVerified: true,
      subscribedToNewsletter: true,
      twoFactorEnabled: true,
    },
    create: {
      name: "Fi Amanillah",
      username: "fiamanillah",
      email: "fi@amanillah.dev",
      password: defaultPasswordHash,
      role: Role.ADMIN,
      headline: "Author & Lead Architect",
      badge: "Author",
      bio: "Full Stack & DevOps Engineer building high-throughput distributed systems.",
      location: "Singapore / Remote",
      website: "https://amanillah.dev",
      githubUrl: "https://github.com/fiamanillah",
      twitterUrl: "https://twitter.com/fiamanillah",
      linkedinUrl: "https://linkedin.com/in/fiamanillah",
      pronouns: "he/him",
      customStatus: "⚡ Optimizing distributed queues",
      avatar: "/fi.png",
      isEmailVerified: true,
      subscribedToNewsletter: true,
      twoFactorEnabled: true,
    },
  });

  // Secondary admin alias
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Portfolio Administrator",
      username: "admin",
      email: "admin@example.com",
      password: defaultPasswordHash,
      role: Role.ADMIN,
      headline: "Portfolio System Administrator",
      badge: "Admin",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
  });

  // 2. Seed Demo User: Alex Chen
  const alexUser = await prisma.user.upsert({
    where: { email: "alex@chen.io" },
    update: {
      name: "Alex Chen",
      username: "alexchen_dev",
      role: Role.MODERATOR,
      headline: "Senior Frontend Engineer",
      badge: "Core Contributor",
      bio: "React & TypeScript enthusiast. Building reactive UI systems and design infrastructure.",
      location: "San Francisco, CA",
      website: "https://alexchen.dev",
      githubUrl: "https://github.com/alexchen",
      twitterUrl: "https://twitter.com/alexchen_dev",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      pronouns: "they/them",
      customStatus: "🎨 Crafting fluid micro-interactions",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
    create: {
      name: "Alex Chen",
      username: "alexchen_dev",
      email: "alex@chen.io",
      password: demoPasswordHash,
      role: Role.MODERATOR,
      headline: "Senior Frontend Engineer",
      badge: "Core Contributor",
      bio: "React & TypeScript enthusiast. Building reactive UI systems and design infrastructure.",
      location: "San Francisco, CA",
      website: "https://alexchen.dev",
      githubUrl: "https://github.com/alexchen",
      twitterUrl: "https://twitter.com/alexchen_dev",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      pronouns: "they/them",
      customStatus: "🎨 Crafting fluid micro-interactions",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
  });

  // 3. Seed Demo User: Sarah Lin
  const sarahUser = await prisma.user.upsert({
    where: { email: "sarah@cloudops.net" },
    update: {
      name: "Sarah Lin",
      username: "sarahlin_sre",
      role: Role.USER,
      headline: "Staff SRE & Distributed Systems",
      badge: "SRE Lead",
      bio: "Passionate about Kubernetes, Redis Streams, and sub-second latency topologies.",
      location: "Seattle, WA",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
    create: {
      name: "Sarah Lin",
      username: "sarahlin_sre",
      email: "sarah@cloudops.net",
      password: demoPasswordHash,
      role: Role.USER,
      headline: "Staff SRE & Distributed Systems",
      badge: "SRE Lead",
      bio: "Passionate about Kubernetes, Redis Streams, and sub-second latency topologies.",
      location: "Seattle, WA",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
  });

  // 4. Seed Subscribers
  const sampleSubscribers = [
    {
      email: "alex.rivera@techcorp.io",
      name: "Alex Rivera",
      status: "subscribed",
      source: "blog_post",
      subscribedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      email: "sarah.c@cloudscale.dev",
      name: "Sarah Connor",
      status: "subscribed",
      source: "hero_section",
      subscribedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      email: "dev.marcus@matrix.org",
      name: "Marcus Vance",
      status: "pending",
      source: "api_docs",
      subscribedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      email: "elena.v@quantum.ai",
      name: "Elena Rostova",
      status: "subscribed",
      source: "blog_post",
      subscribedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      email: "jordan.taylor@enterprise.net",
      name: "Jordan Taylor",
      status: "unsubscribed",
      source: "newsletter_modal",
      subscribedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      email: "maya.patel@synthetix.io",
      name: "Maya Patel",
      status: "subscribed",
      source: "hero_section",
      subscribedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      email: "lucas.silva@bytecraft.br",
      name: "Lucas Silva",
      status: "subscribed",
      source: "project_showcase",
      subscribedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      email: "chloe.dupont@atelier.fr",
      name: "Chloe Dupont",
      status: "pending",
      source: "newsletter_modal",
      subscribedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      email: "daniel.kim@hyperlink.kr",
      name: "Daniel Kim",
      status: "subscribed",
      source: "admin_portal",
      subscribedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      email: "nathan.drake@uncharted.io",
      name: "Nathan Drake",
      status: "unsubscribed",
      source: "blog_post",
      subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const sub of sampleSubscribers) {
    await prisma.subscriber.upsert({
      where: { email: sub.email },
      update: {
        name: sub.name,
        status: sub.status,
        source: sub.source,
      },
      create: sub,
    });
  }

  // 5. Seed Blog Categories
  const categoriesData = [
    { name: "WebSockets", slug: "websockets", description: "Real-time communication, pub/sub architectures, and bidirectional streams", color: "blue", order: 1 },
    { name: "Architecture", slug: "architecture", description: "Distributed systems, microservices design, and high-throughput scaling", color: "emerald", order: 2 },
    { name: "Database", slug: "database", description: "PostgreSQL, Redis, caching layers, and database query optimization", color: "amber", order: 3 },
    { name: "Performance", slug: "performance", description: "Latency reduction, load testing, memory profiling, and edge computing", color: "purple", order: 4 },
    { name: "DevOps", slug: "devops", description: "Docker, CI/CD automation, VPS provisioning, and cloud orchestration", color: "rose", order: 5 },
    { name: "Security", slug: "security", description: "API security, authentication, artifact signing, and zero-trust systems", color: "cyan", order: 6 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const categoryRecord = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        color: cat.color,
        order: cat.order,
      },
      create: cat,
    });
    categoryMap.set(cat.name.toLowerCase(), categoryRecord.id);
  }

  // 6. Seed Blog Posts from local JSON definitions
  const blogFiles = [
    "building-distributed-systems-websockets-redis.json",
    "scaling-rabbitmq-redis.json",
    "realtime-websockets-stripe.json",
    "docker-vps-cicd-deployment.json",
    "prisma-postgres-optimization.json",
    "rest-api-security-best-practices.json",
    "typescript-monorepo-turbo.json",
    "distributed-tracing-opentelemetry.json",
    "cicd-artifact-signing-security.json",
  ];

  const fs = await import("fs/promises");
  const path = await import("path");
  const blogPostsDir = path.resolve(__dirname, "../../../apps/web/src/data/blog-posts");

  let seededPostsCount = 0;
  for (const file of blogFiles) {
    const filePath = path.join(blogPostsDir, file);
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const post = JSON.parse(fileContent);

      const categoryId = categoryMap.get(post.category?.toLowerCase()) || null;
      const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 0;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      const publishedAt = post.publishedAt ? new Date(post.publishedAt) : new Date("2025-08-01T00:00:00.000Z");

      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          subtitle: post.subtitle || null,
          summary: post.summary,
          content: post.content,
          thumbnail: post.thumbnail,
          status: "PUBLISHED",
          featured: Boolean(post.featured),
          readTime: post.readTime || `${readTimeMinutes} MIN READ`,
          readTimeMinutes,
          wordCount,
          date: post.date || "AUG 2025",
          publishedAt,
          modifiedAt: post.modifiedAt ? new Date(post.modifiedAt) : publishedAt,
          views: post.views ? (parseInt(post.views.replace(/[^0-9]/g, "")) || 0) * (post.views.includes("k") ? 1000 : 1) : 1250,
          likesCount: 42,
          commentsCount: 3,
          keyTakeaways: post.keyTakeaways || [],
          tags: post.tags || [],
          categoryId,
          authorId: adminUser.id,
          authorName: post.author?.name || adminUser.name,
          authorRole: post.author?.role || adminUser.headline,
          authorAvatar: post.author?.avatar || adminUser.avatar,
          authorTwitter: post.author?.twitter || adminUser.twitterUrl,
          authorLinkedin: post.author?.linkedin || adminUser.linkedinUrl,
          authorGithub: post.author?.github || adminUser.githubUrl,
          metaTitle: post.seo?.metaTitle || `${post.title} | Fi Amanillah`,
          metaDescription: post.seo?.metaDescription || post.summary,
          metaKeywords: post.seo?.keywords || post.tags || [],
          ogTitle: post.seo?.metaTitle || post.title,
          ogDescription: post.seo?.metaDescription || post.summary,
          ogImage: post.seo?.ogImage || post.thumbnail,
          ogType: post.seo?.ogType || "article",
          canonicalUrl: post.seo?.canonicalUrl || null,
          articleType: post.seo?.articleType || "TechArticle",
          noIndex: Boolean(post.seo?.noIndex),
        },
        create: {
          slug: post.slug,
          title: post.title,
          subtitle: post.subtitle || null,
          summary: post.summary,
          content: post.content,
          thumbnail: post.thumbnail,
          status: "PUBLISHED",
          featured: Boolean(post.featured),
          readTime: post.readTime || `${readTimeMinutes} MIN READ`,
          readTimeMinutes,
          wordCount,
          date: post.date || "AUG 2025",
          publishedAt,
          modifiedAt: post.modifiedAt ? new Date(post.modifiedAt) : publishedAt,
          views: post.views ? (parseInt(post.views.replace(/[^0-9]/g, "")) || 0) * (post.views.includes("k") ? 1000 : 1) : 1250,
          likesCount: 42,
          commentsCount: 3,
          keyTakeaways: post.keyTakeaways || [],
          tags: post.tags || [],
          categoryId,
          authorId: adminUser.id,
          authorName: post.author?.name || adminUser.name,
          authorRole: post.author?.role || adminUser.headline,
          authorAvatar: post.author?.avatar || adminUser.avatar,
          authorTwitter: post.author?.twitter || adminUser.twitterUrl,
          authorLinkedin: post.author?.linkedin || adminUser.linkedinUrl,
          authorGithub: post.author?.github || adminUser.githubUrl,
          metaTitle: post.seo?.metaTitle || `${post.title} | Fi Amanillah`,
          metaDescription: post.seo?.metaDescription || post.summary,
          metaKeywords: post.seo?.keywords || post.tags || [],
          ogTitle: post.seo?.metaTitle || post.title,
          ogDescription: post.seo?.metaDescription || post.summary,
          ogImage: post.seo?.ogImage || post.thumbnail,
          ogType: post.seo?.ogType || "article",
          canonicalUrl: post.seo?.canonicalUrl || null,
          articleType: post.seo?.articleType || "TechArticle",
          noIndex: Boolean(post.seo?.noIndex),
        },
      });

      // Seed tags
      for (const tag of post.tags || []) {
        const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          update: { name: tag },
          create: { name: tag, slug: tagSlug },
        });
      }

      seededPostsCount++;
    } catch (err) {
      console.warn(`Could not seed blog post from ${file}:`, err);
    }
  }

  // 7. Seed Case Studies directly
  const SEED_CASE_STUDIES = [
    {
      slug: "mickanic",
      title: "Mickanic — Real-Time Bidding & Service Marketplace Platform",
      subtitle: "Real-Time Bidding & Service Marketplace Platform",
      description: "I architected a service-based marketplace using Next.js 16 and Bun, integrating real-time bidding, Socket.io messaging, and tiered Stripe subscriptions, backed by PostgreSQL and RabbitMQ.",
      status: "PUBLISHED" as const,
      projectStatus: "Status: Completed",
      order: 1,
      featured: true,
      pinned: true,
      techStack: ["Next.js 16", "Bun", "PostgreSQL", "Prisma", "RabbitMQ", "Redis", "Socket.io", "Stripe", "Docker", "Redux Toolkit", "Tailwind CSS 4"],
      liveUrl: "https://mickanic.ca/",
      githubUrl: null,
      image: "/assets/images/mickanic-cover.png",
      imageLabel: "Mickanic_Architecture_Overview.png",
      role: "Backend & DevOps Engineer",
      timeline: "2025 - 2026",
      client: "Mickanic",
      impact: "Engineered contractor credit/bidding engine with Stripe billing, real-time Socket.io messaging with Redis, and Docker Compose deployment.",
      views: 2840,
      likesCount: 98,
      publishedAt: new Date("2026-01-15T00:00:00.000Z"),
      metadata: [
        { label: "Role", value: "Backend & DevOps Engineer" },
        { label: "Timeline", value: "2025 - 2026" },
        { label: "Client / Company", value: "Mickanic" },
        { label: "Tech Stack", value: "Next.js 16, Bun, PostgreSQL, RabbitMQ" },
      ],
      contextBlocks: [
        { label: "The Problem", body: "Drivers needed a platform to post vehicle-service jobs, while mechanics needed a centralized place to browse jobs, submit bids, and manage subscriptions. A seamless way to connect and communicate was required for the Mickanic platform." },
        { label: "The Solution", body: "I developed a service-based marketplace connecting consumers and contractors. The solution features a Next.js frontend and a Bun-powered API, featuring real-time Socket.io messaging and RabbitMQ background workers." },
      ],
      architectureLayers: [
        { name: "Client / UI", description: "Frontend application catering to Admin, Consumer, and Contractor roles.", items: [{ title: "Next.js 16 & React 19", subtitle: "App Router framework" }, { title: "Tailwind CSS 4", subtitle: "Utility-first styling" }, { title: "Redux Toolkit Query", subtitle: "State & API data fetching" }] },
        { name: "API & Compute", description: "High-performance backend API and WebSocket server.", items: [{ title: "Bun", subtitle: "JavaScript runtime and package manager" }, { title: "Express", subtitle: "Backend API framework" }, { title: "Socket.IO", subtitle: "Real-time communication" }] },
        { name: "Data Layer", description: "Relational database, caching, and object storage.", items: [{ title: "PostgreSQL", subtitle: "Primary database via Prisma ORM" }, { title: "Redis", subtitle: "In-memory caching store" }, { title: "MinIO", subtitle: "S3-compatible object storage" }] },
        { name: "Infra / Delivery", description: "Containerized orchestration and asynchronous task queues.", items: [{ title: "Docker Compose", subtitle: "Multi-container orchestration" }, { title: "RabbitMQ", subtitle: "Asynchronous message broker" }, { title: "Stripe", subtitle: "Payment and subscription processing" }] },
      ],
      features: [
        { title: "Real-Time Bidding & Messaging", description: "Implemented a real-time messaging system between consumers and contractors using Socket.IO. The frontend utilizes Redux Toolkit Query alongside real-time hooks to manage conversations and typing indicators without full page reloads.", mediaType: "Image / Video", mediaLabel: "Messaging Interface", media: "/assets/images/mickanic-chat.png", tags: ["Socket.IO", "RTK Query", "Optimistic UI"], highlights: ["Instant bid updates & chat sync across active browser clients", "Optimistic state updates via Redux Toolkit Query handlers", "Typing indicators & read receipt state management"] },
        { title: "Tiered Subscription Engine", description: "Integrated tiered subscription plans (Basic, Premium, Pro) for contractors, which govern job application limits, lead costs, and platform visibility. Stripe is used for handling the subscription and payment workflows.", mediaType: "Image / Video", mediaLabel: "Subscription Plans", media: "/assets/images/mickanic-billing.png", tags: ["Stripe API", "Webhooks", "Tiered Access"], highlights: ["Dynamic job bidding quota management based on tier levels", "Stripe Customer Portal integration for effortless plan upgrades", "Idempotent webhook handlers for subscription lifecycle events"] },
        { title: "Event-Driven Background Processing", description: "Offloaded heavy processing like email delivery and web-push notifications to a background worker using RabbitMQ. This ensures the main API remains responsive during high-traffic events, with an hourly email limit of 150 strictly enforced.", mediaType: "Architecture / Infra", mediaLabel: "Docker Worker Architecture", media: "/assets/images/mickanic-cover.png", tags: ["Docker", "Bun Runtime", "RabbitMQ"], highlights: ["Isolated background containerized execution via Docker Compose", "Bun runtime execution for fast startup & minimal memory overhead", "Rate-limited queue consumer processing strictly 150 emails/hour"] },
      ],
      metrics: [
        { value: "3", label: "Distinct user roles (Admin, Consumer, Contractor)" },
        { value: "150", label: "Hourly email sending limit via RabbitMQ" },
        { value: "3", label: "Contractor subscription tiers (Basic, Premium, Pro)" },
        { value: "100%", label: "Type safety with Prisma and TypeScript" },
      ],
      postMortem: [
        { title: "Technical Challenges", entries: [{ heading: "Real-Time State Synchronization", detail: "Keeping the optimistic UI in sync with backend state was complex. We leveraged Redux Toolkit Query to cache data and refresh active conversations automatically upon receiving Socket.IO events." }, { heading: "Asynchronous Notification Delivery", detail: "Blocking the main thread for transactional emails degraded performance. Implementing RabbitMQ allowed us to queue tasks like contact_auto_reply, handling them via a dedicated Bun email worker." }] },
        { title: "Lessons Learned", entries: [{ heading: "Infrastructure Orchestration", detail: "Bundling PostgreSQL, Redis, and RabbitMQ within a single docker-compose.yml file simplified local development and ensured parity across environments." }, { heading: "Schema-Driven Type Safety", detail: "Using Prisma allowed us to define a single schema for users, contractors, jobs, and bids. Generating the client directly from the schema ensured reliable database operations." }] },
      ],
    },
    {
      slug: "moja-cares",
      title: "Moja Cares — Healthcare Management & Patient Care Portal",
      subtitle: "Healthcare Management & Patient Care Portal",
      description: "Comprehensive healthcare management portal featuring multi-role RBAC, real-time clinical team chats, automated alerts, AI-powered document insight extraction, and Paystack billing integration.",
      status: "PUBLISHED" as const,
      projectStatus: "Status: Live",
      order: 2,
      featured: true,
      pinned: false,
      techStack: ["TypeScript", "Express", "Prisma", "PostgreSQL", "Redis", "RabbitMQ", "WebSockets", "OpenAI API", "AWS S3", "Paystack"],
      liveUrl: "https://dev.mojacares.com/",
      githubUrl: null,
      image: "/assets/images/moja-cares-cover.png",
      imageLabel: "Moja_Cares_Dashboard_Overview.png",
      role: "Backend Developer",
      timeline: "2026",
      client: "Moja Cares",
      impact: "Architected OpenAI API health insights worker, WebSocket patient-care chat, SES/Postmark alert dispatch, and Paystack billing.",
      views: 1920,
      likesCount: 74,
      publishedAt: new Date("2026-01-15T00:00:00.000Z"),
      metadata: [
        { label: "Role", value: "Backend Developer" },
        { label: "Timeline", value: "2026" },
        { label: "Client / Company", value: "Moja Cares" },
        { label: "Tech Stack", value: "Express, TypeScript, OpenAI API, WebSockets" },
      ],
      contextBlocks: [
        { label: "The Problem", body: "Healthcare providers and clinical care teams needed a unified digital platform to handle multi-role patient access, stream real-time patient status updates, manage team communication, and analyze unstructured clinical documents without manual data entry bottlenecks." },
        { label: "The Solution", body: "I architected the Moja Cares portal with a high-throughput Express API, WebSocket infrastructure for real-time care team chat, asynchronous message queues for transactional alerts, an automated OpenAI worker for medical document processing, and Paystack subscription management." },
      ],
      architectureLayers: [
        { name: "Client / UI", description: "Multi-role responsive web application for Admins, Doctors, Nurses, and Patients.", items: [{ title: "Next.js & React", subtitle: "App Router & SSR" }, { title: "Tailwind CSS", subtitle: "Utility-first styling system" }, { title: "Zustand & SWR", subtitle: "Optimistic state & data hydration" }] },
        { name: "API & Compute", description: "High-performance backend services and WebSocket communication nodes.", items: [{ title: "Express (Node.js)", subtitle: "Primary REST API aggregation" }, { title: "WebSockets", subtitle: "Full-duplex clinical chat nodes" }, { title: "OpenAI Worker", subtitle: "Background document analysis pipeline" }] },
        { name: "Data Layer", description: "Relational database state, ephemeral memory caching, and object storage.", items: [{ title: "PostgreSQL", subtitle: "Relational medical records via Prisma" }, { title: "Redis", subtitle: "Session cache & socket event pub/sub" }, { title: "AWS S3", subtitle: "Secure patient document storage" }] },
        { name: "Infra / Delivery", description: "Event brokering, notification dispatch, and payment gateways.", items: [{ title: "RabbitMQ", subtitle: "Asynchronous worker queue orchestration" }, { title: "AWS SES / Postmark", subtitle: "Transactional alert dispatch" }, { title: "Paystack API", subtitle: "Subscription & medical billing webhooks" }] },
      ],
      features: [
        { title: "Real-Time Clinical Team Chat", description: "Implemented persistent WebSocket channels allowing doctors, nurses, and care administrators to exchange encrypted patient updates instantly with typing indicators and read receipts.", mediaType: "Image / Video", mediaLabel: "Clinical Team Messaging", media: "/assets/images/moja-cares-chat.png", tags: ["WebSockets", "Redis Pub/Sub", "Encrypted Messaging"], highlights: ["Sub-50ms message latency across distributed care nodes", "Role-restricted multi-party channels (Admins, Doctors, Nurses)", "Presence tracking & real-time typing indicators"] },
        { title: "AI-Powered Document Insight Extraction", description: "Developed an automated background pipeline leveraging the OpenAI API to extract critical medical markers, risk flags, and summary points from uploaded health records.", mediaType: "Image / Video", mediaLabel: "AI Document Analysis", media: "/assets/images/moja-cares-insights.png", tags: ["OpenAI API", "AWS S3", "Async Worker"], highlights: ["Automated extraction of vital medical markers & risk alerts", "Direct pre-signed AWS S3 upload pipeline avoiding API bottlenecks", "Structured JSON schema response parsing with fallback validation"] },
        { title: "Automated Alert Dispatch & Queuing", description: "Offloaded instant SMS and email notifications to background RabbitMQ workers consumed by standalone microservices to ensure reliable alert delivery under peak clinical loads.", mediaType: "Architecture / Infra", mediaLabel: "Alert Worker Architecture", media: "/assets/images/moja-cares-cover.png", tags: ["RabbitMQ", "Microservices", "Event-Driven"], highlights: ["Guaranteed persistent message delivery for high-priority alerts", "Non-blocking API throughput under heavy emergency care events", "Dead-letter exchange setup for failed notification retries"] },
      ],
      metrics: [
        { value: "4", label: "Distinct user roles (Admin, Doctor, Nurse, Patient)" },
        { value: "<50ms", label: "WebSocket real-time chat latency" },
        { value: "10k+", label: "Clinical health insights extracted via AI worker" },
        { value: "99.9%", label: "Uptime for asynchronous alert delivery" },
      ],
      postMortem: [
        { title: "Technical Challenges", entries: [{ heading: "Handling Large Medical Document Processing", detail: "Parsing heavy medical PDF records caused API response stalls. Solved by decoupling document uploads directly to AWS S3, then dispatching asynchronous AI processing jobs over RabbitMQ." }, { heading: "Real-Time Multi-Party Socket Sync", detail: "Syncing care team chat state across multiple server instances required unified pub/sub. Implemented Redis Pub/Sub adapter for WebSockets to guarantee message delivery across nodes." }] },
        { title: "Lessons Learned", entries: [{ heading: "Asynchronous First Architecture", detail: "Offloading document intelligence and email dispatches to dedicated background workers protected core patient API latency during peak clinic hours." }, { heading: "Strict Type Safety", detail: "Defining centralized Prisma schemas and TypeScript contracts eliminated schema drift between care team APIs, socket payloads, and billing webhooks." }] },
      ],
    },
  ];

  let seededCaseStudiesCount = 0;
  for (const cs of SEED_CASE_STUDIES) {
    try {
      const caseStudyData = {
        title: cs.title,
        subtitle: cs.subtitle,
        description: cs.description,
        status: cs.status,
        projectStatus: cs.projectStatus,
        order: cs.order,
        featured: cs.featured,
        pinned: cs.pinned,
        techStack: cs.techStack,
        liveUrl: cs.liveUrl,
        githubUrl: cs.githubUrl,
        image: cs.image,
        imageLabel: cs.imageLabel,
        role: cs.role,
        timeline: cs.timeline,
        client: cs.client,
        impact: cs.impact,
        views: cs.views,
        likesCount: cs.likesCount,
        publishedAt: cs.publishedAt,
        authorId: adminUser.id,
        authorName: adminUser.name,
        authorRole: adminUser.headline,
        authorAvatar: adminUser.avatar,
        authorTwitter: adminUser.twitterUrl,
        authorLinkedin: adminUser.linkedinUrl,
        authorGithub: adminUser.githubUrl,
        metadata: cs.metadata,
        contextBlocks: cs.contextBlocks,
        architectureLayers: cs.architectureLayers,
        features: cs.features,
        metrics: cs.metrics,
        postMortem: cs.postMortem,
        metaTitle: `${cs.title} | Technical Case Study`,
        metaDescription: cs.description,
        metaKeywords: cs.techStack,
        ogTitle: cs.title,
        ogDescription: cs.description,
        ogImage: cs.image,
        twitterCard: "summary_large_image",
        canonicalUrl: `https://fi.amanillah.com/case-study/${cs.slug}`,
      };

      await prisma.caseStudy.upsert({
        where: { slug: cs.slug },
        update: caseStudyData,
        create: {
          slug: cs.slug,
          ...caseStudyData,
        },
      });

      seededCaseStudiesCount++;
    } catch (err) {
      console.warn(`Could not seed case study ${cs.slug}:`, err);
    }
  }

  // 6. Seed Professional History / Experiences
  const initialExperiences = [
    {
      company: "Softvence Agency",
      companyUrl: "https://softvence.agency",
      role: "FULL STACK DEVELOPER",
      title: ["FULL STACK", "DEVELOPER"],
      location: "Dhaka, Bangladesh · Remote-Friendly",
      employmentType: "Full-Time",
      period: "PRESENT // 14 MO",
      year: "2025",
      isCurrent: true,
      description:
        "Architected type-safe backend systems with TypeScript, Express.js, and Prisma ORM, integrated with React.js frontends to deliver responsive, high-performance applications.",
      highlights: [
        "Decoupled intensive background tasks like email and AI processing using RabbitMQ message brokers",
        "Improved database query latency and API response times by implementing Redis caching",
        "Built granular role-based access control (RBAC), real-time WebSockets, and Stripe/Paystack tiered subscription billing",
        "Containerized multi-service environments with Docker and managed VPS deployments with AWS S3/MinIO media storage",
      ],
      technologies: [
        "TypeScript",
        "Express.js",
        "Prisma ORM",
        "PostgreSQL",
        "Redis",
        "RabbitMQ",
        "WebSockets",
        "Stripe",
        "Paystack",
        "Docker",
        "AWS S3",
        "MinIO",
        "Linux VPS",
      ],
      stats: [
        { label: "Background Queues", value: "RabbitMQ" },
        { label: "Billing Systems", value: "Stripe & Paystack" },
        { label: "Storage Providers", value: "AWS S3 / MinIO" },
      ],
      learned:
        "Mastered decoupling intensive background jobs and optimizing database access patterns to ensure seamless scalability and real-time reliability under load.",
      status: ExperienceStatus.PUBLISHED,
      featured: true,
      order: 0,
    },
  ];

  let seededExperiencesCount = 0;
  for (const exp of initialExperiences) {
    try {
      const existing = await prisma.experience.findFirst({
        where: { company: exp.company, role: exp.role },
      });

      if (!existing) {
        await prisma.experience.create({
          data: exp,
        });
        seededExperiencesCount++;
      } else {
        await prisma.experience.update({
          where: { id: existing.id },
          data: exp,
        });
        seededExperiencesCount++;
      }
    } catch (err) {
      console.warn(`Could not seed experience ${exp.company}:`, err);
    }
  }

  console.log(`✅ Seeded users, subscribers, blog posts, case studies, and experiences successfully:
  - Admin: ${adminUser.email} (${adminUser.role})
  - Moderator: ${alexUser.email} (${alexUser.role})
  - User: ${sarahUser.email} (${sarahUser.role})
  - Subscribers: ${sampleSubscribers.length} records
  - Categories: ${categoriesData.length} records
  - Blog Posts: ${seededPostsCount} posts migrated
  - Case Studies: ${seededCaseStudiesCount} case studies migrated
  - Experiences: ${seededExperiencesCount} experiences migrated
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
