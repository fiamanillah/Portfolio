// src/index.ts
import { IgnitorApp } from "./core/IgnitorApp"
import { AppLogger } from "@workspace/logger"
import { config } from "./core/config"

// Providers (Infrastructure)
import { PrismaProvider } from "./providers/PrismaProvider"
import { R2StorageProvider } from "./providers/R2StorageProvider"
import { prisma } from "@workspace/db"
import { AuthModule } from "./Modules/Auth/AuthModule"
import { UserModule } from "./Modules/User/UserModule"
import { ContactModule } from "./Modules/Contact/ContactModule"
import { SubscriberModule } from "./Modules/Subscriber/SubscriberModule"
import { TemplateModule } from "./Modules/Template/TemplateModule"
import { BlogModule } from "./Modules/Blog/BlogModule"
import { CommentModule } from "./Modules/Comment/CommentModule"
import { MediaModule } from "./Modules/Media/MediaModule"
import { CaseStudyModule } from "./Modules/CaseStudy/CaseStudyModule"
import { NewsletterModule } from "./Modules/Newsletter/NewsletterModule"
import { ExperienceModule } from "./Modules/Experience/ExperienceModule"

// Modules (Business Logic)

const logger = new AppLogger("Bootstrap")

async function bootstrap() {
  try {
    logger.info("🗹 Starting application bootstrap")

    // 1. Initialize the Ignitor Engine
    const app = new IgnitorApp()

    // 2. Register Infrastructure Providers
    logger.info("⚙ Registering infrastructure...")
    app.getContext().registerProvider("prisma", new PrismaProvider(prisma))
    app.getContext().registerProvider("storage", new R2StorageProvider())

    // 3. Register Application Modules
    logger.info("⚙ Registering modules...")
    app.registerModule(new AuthModule())
    app.registerModule(new UserModule())
    app.registerModule(new ContactModule())
    app.registerModule(new SubscriberModule())
    app.registerModule(new TemplateModule())
    app.registerModule(new BlogModule())
    app.registerModule(new CommentModule())
    app.registerModule(new MediaModule())
    app.registerModule(new CaseStudyModule())
    app.registerModule(new NewsletterModule())
    app.registerModule(new ExperienceModule())
    logger.info("✔ All modules registered successfully")

    // 4. Spark the server!
    await app.spark(config.server.port)

    logger.info("✷ Ignitor sparked successfully")
  } catch (error) {
    // Centralized Bootstrap Error Handling
    logger.error("⬤ Failed to initialize application:", {
      error: error instanceof Error ? error : new Error(String(error)),
      context: "application-bootstrap",
      stack: error instanceof Error ? error.stack : undefined,
    })
    process.exit(1)
  }
}

// Start the application
bootstrap().catch((err) => {
  logger.error("❌ Unhandled bootstrap error:", { error: err })
  process.exit(1)
})
