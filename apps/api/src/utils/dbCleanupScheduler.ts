// src/utils/dbCleanupScheduler.ts
// Periodic cleanup of expired OTPs, revoked refresh tokens, and stale records
// to prevent unbounded table growth in production.

import { prisma } from "@workspace/db"
import { AppLogger } from "@workspace/logger"

const logger = new AppLogger("DBCleanupScheduler")

/**
 * Purge expired and used OTP verification records older than 24 hours.
 */
async function cleanupExpiredOtps(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

  const result = await prisma.otpVerification.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { used: true, createdAt: { lt: cutoff } },
      ],
    },
  })

  return result.count
}

/**
 * Purge revoked or expired refresh tokens older than 7 days.
 */
async function cleanupExpiredRefreshTokens(): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null, lt: cutoff } },
      ],
    },
  })

  return result.count
}

/**
 * Run all cleanup tasks and log results.
 */
async function runCleanup(): Promise<void> {
  try {
    const [otpCount, tokenCount] = await Promise.all([
      cleanupExpiredOtps(),
      cleanupExpiredRefreshTokens(),
    ])

    if (otpCount > 0 || tokenCount > 0) {
      logger.info(
        `✔ DB Cleanup completed: ${otpCount} expired OTPs, ${tokenCount} expired/revoked refresh tokens purged`
      )
    }
  } catch (error) {
    logger.error("❌ DB Cleanup job failed:", {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

let cleanupIntervalId: ReturnType<typeof setInterval> | null = null

/**
 * Start the periodic cleanup scheduler.
 * @param intervalMs - Interval in milliseconds between cleanup runs. Default: 6 hours.
 */
export function startCleanupScheduler(
  intervalMs: number = 6 * 60 * 60 * 1000
): void {
  if (cleanupIntervalId) {
    logger.warn("Cleanup scheduler is already running. Skipping duplicate start.")
    return
  }

  // Run once on startup (delayed by 60 seconds to let boot finish)
  setTimeout(() => {
    runCleanup()
  }, 60 * 1000)

  // Schedule periodic runs
  cleanupIntervalId = setInterval(runCleanup, intervalMs)

  logger.info(
    `✔ DB Cleanup scheduler started (every ${Math.round(intervalMs / 60000)} minutes)`
  )
}

/**
 * Stop the cleanup scheduler.
 */
export function stopCleanupScheduler(): void {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId)
    cleanupIntervalId = null
    logger.info("✔ DB Cleanup scheduler stopped")
  }
}
