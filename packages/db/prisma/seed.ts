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

  console.log(`✅ Seeded users successfully:
  - Admin: ${adminUser.email} (${adminUser.role})
  - Moderator: ${alexUser.email} (${alexUser.role})
  - User: ${sarahUser.email} (${sarahUser.role})
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
