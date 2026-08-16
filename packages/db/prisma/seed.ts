import { prisma, Role } from "../src/index";

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

  console.log(`✅ Seeded users, subscribers, and blog posts successfully:
  - Admin: ${adminUser.email} (${adminUser.role})
  - Moderator: ${alexUser.email} (${alexUser.role})
  - User: ${sarahUser.email} (${sarahUser.role})
  - Subscribers: ${sampleSubscribers.length} records
  - Categories: ${categoriesData.length} records
  - Blog Posts: ${seededPostsCount} posts migrated
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
