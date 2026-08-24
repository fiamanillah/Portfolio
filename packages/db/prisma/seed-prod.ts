import { prisma, Role } from "../src/index";
import { loadEnv } from "@workspace/env/loader";

// Ensure environment variables from root/local .env are loaded
loadEnv();

async function main() {
  console.log("🔐 Starting Production Admin Seed...");

  const adminEmail = (
    process.env.DEFAULT_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@example.com"
  ).trim().toLowerCase();

  const adminPassword =
    process.env.DEFAULT_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    "change-me-immediately";

  const adminName = (
    process.env.DEFAULT_ADMIN_NAME ||
    process.env.ADMIN_NAME ||
    "Portfolio Administrator"
  ).trim();

  const defaultUsername = adminEmail
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();

  const adminUsername = (
    process.env.DEFAULT_ADMIN_USERNAME ||
    process.env.ADMIN_USERNAME ||
    defaultUsername ||
    "admin"
  ).trim();

  const adminHeadline =
    process.env.DEFAULT_ADMIN_HEADLINE ||
    process.env.ADMIN_HEADLINE ||
    "Portfolio System Administrator";

  const adminBadge =
    process.env.DEFAULT_ADMIN_BADGE ||
    process.env.ADMIN_BADGE ||
    "Admin";

  if (!adminEmail || !adminEmail.includes("@")) {
    throw new Error(`[Seed Error] Invalid DEFAULT_ADMIN_EMAIL: "${adminEmail}"`);
  }

  if (!adminPassword || adminPassword.length < 8) {
    console.warn(
      `⚠️ [Warning] Admin password is shorter than 8 characters or using default.`
    );
  }

  if (adminPassword === "change-me-immediately") {
    console.warn(
      "⚠️ [Warning] Using default placeholder password 'change-me-immediately'. Set DEFAULT_ADMIN_PASSWORD in your .env for production."
    );
  }

  // Hash password using Bun's native bcrypt implementation
  const passwordHash = await Bun.password.hash(adminPassword, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Check if username is taken by a different user
  const existingUsernameUser = await prisma.user.findUnique({
    where: { username: adminUsername },
    select: { id: true, email: true },
  });

  const finalUsername =
    existingUsernameUser && existingUsernameUser.email !== adminEmail
      ? `${adminUsername}_${Math.floor(1000 + Math.random() * 9000)}`
      : adminUsername;

  // Upsert the Admin User
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: passwordHash,
      role: Role.ADMIN,
      headline: adminHeadline,
      badge: adminBadge,
      isEmailVerified: true,
    },
    create: {
      name: adminName,
      username: finalUsername,
      email: adminEmail,
      password: passwordHash,
      role: Role.ADMIN,
      headline: adminHeadline,
      badge: adminBadge,
      isEmailVerified: true,
      subscribedToNewsletter: true,
      twoFactorEnabled: false,
    },
  });

  console.log(`
====================================================
✅ Production Admin Account Seeded Successfully!
====================================================
  • User ID:       ${admin.id}
  • Email:         ${admin.email}
  • Username:      ${admin.username}
  • Role:          ${admin.role}
  • Name:          ${admin.name}
  • Email Verified:${admin.isEmailVerified}
====================================================
  `);
}

main()
  .catch((e) => {
    console.error("❌ Production Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
