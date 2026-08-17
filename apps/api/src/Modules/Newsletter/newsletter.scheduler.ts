// src/Modules/Newsletter/newsletter.scheduler.ts
import { prisma } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import { NewsletterDispatcher } from "./newsletter.dispatcher";

export class NewsletterScheduler {
  private static logger = new AppLogger("NewsletterScheduler");
  private static intervalTimer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Starts the background scheduler polling loop.
   */
  public static start(intervalMs: number = 60000): void {
    if (this.intervalTimer) return;

    this.logger.info(`Starting Newsletter background scheduler (Polling every ${intervalMs / 1000}s)`);

    // Run check immediately on start
    this.checkScheduledNewsletters().catch((err) => {
      this.logger.error("Error in initial scheduled newsletter check:", { error: err });
    });

    this.intervalTimer = setInterval(() => {
      this.checkScheduledNewsletters().catch((err) => {
        this.logger.error("Error during recurring scheduled newsletter poll:", { error: err });
      });
    }, intervalMs);
  }

  /**
   * Stops the background scheduler polling loop.
   */
  public static stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
      this.logger.info("Newsletter background scheduler stopped.");
    }
  }

  /**
   * Polls database for any due scheduled campaigns and safely initiates dispatch.
   */
  public static async checkScheduledNewsletters(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();
      const dueCampaigns = await prisma.newsletter.findMany({
        where: {
          status: "SCHEDULED",
          scheduledAt: {
            lte: now,
          },
        },
        select: {
          id: true,
          title: true,
          scheduledAt: true,
        },
      });

      if (dueCampaigns.length > 0) {
        this.logger.info(`Found ${dueCampaigns.length} scheduled campaign(s) ready for dispatch.`);

        for (const campaign of dueCampaigns) {
          try {
            this.logger.info(
              `Triggering scheduled broadcast for "${campaign.title}" (${campaign.id})`
            );
            // Execute campaign dispatch
            await NewsletterDispatcher.dispatchCampaign(campaign.id);
          } catch (err: any) {
            this.logger.error(
              `Failed to dispatch scheduled campaign ${campaign.id}:`,
              { error: err?.message || err }
            );
          }
        }
      }
    } catch (err: any) {
      this.logger.error("Scheduler database error:", { error: err?.message || err });
    } finally {
      this.isRunning = false;
    }
  }
}
