// apps/api/src/tests/newsletter.test.ts
import { describe, it, expect } from "bun:test";
import { NewsletterSpamAnalyzer } from "@/Modules/Newsletter/newsletter.spam-analyzer";
import { NewsletterRecipientResolver } from "@/Modules/Newsletter/newsletter.recipient";
import { NewsletterDispatcher } from "@/Modules/Newsletter/newsletter.dispatcher";
import { prisma } from "@workspace/db";

describe("Newsletter Module & Deliverability Engine", () => {
  describe("Anti-Spam Analyzer (newsletter.spam-analyzer.ts)", () => {
    it("should score clean technical content with high deliverability score (>= 90)", () => {
      const report = NewsletterSpamAnalyzer.analyze({
        subject: "Deep Dive: Distributed Real-Time Architecture & Event Streams",
        previewText:
          "An overview of high-throughput distributed architectures, zero-downtime migrations, and event patterns.",
        content: `
          <p>Hi Alex,</p>
          <p>Over the past few weeks, we designed and benchmarked a high-throughput event-driven microservices architecture.</p>
          <p>Key takeaways include mitigating connection pool exhaustion, idempotent webhooks, and telemetry configurations.</p>
          <p>Read the full article on <a href="https://fi.amanillah.com/blog">fi.amanillah.com</a>.</p>
        `,
        senderEmail: "fi@amanillah.com",
      });

      expect(report.score).toBeGreaterThanOrEqual(90);
      expect(report.riskLevel).toBe("LOW");
      expect(report.checks.every((c) => c.passed)).toBe(true);
    });

    it("should penalize high-risk spam keywords in subject and content", () => {
      const report = NewsletterSpamAnalyzer.analyze({
        subject: "100% FREE MONEY! ACT NOW TO CLAIM CASH BONUS!!!",
        previewText: "Winner selected for million dollars giveaway",
        content: "<p>Make money fast with no risk. Double your income from home.</p>",
        senderEmail: "promo@spamdomain.com",
      });

      expect(report.score).toBeLessThan(65);
      expect(report.riskLevel).toBe("HIGH");

      const spamWordCheck = report.checks.find(
        (c) => c.id === "subject_spam_keywords"
      );
      expect(spamWordCheck?.passed).toBe(false);
      expect(spamWordCheck?.scorePenalty).toBeGreaterThan(0);

      const punctuationCheck = report.checks.find(
        (c) => c.id === "subject_punctuation"
      );
      expect(punctuationCheck?.passed).toBe(false);

      const capsCheck = report.checks.find((c) => c.id === "subject_all_caps");
      expect(capsCheck?.passed).toBe(false);
    });

    it("should detect and penalize missing preheaders", () => {
      const report = NewsletterSpamAnalyzer.analyze({
        subject: "Engineering Updates and Releases",
        previewText: "",
        content:
          "<p>Here are the latest software updates and release notes from our engineering team.</p>",
      });

      const preheaderCheck = report.checks.find(
        (c) => c.id === "preheader_presence"
      );
      expect(preheaderCheck?.passed).toBe(false);
      expect(preheaderCheck?.scorePenalty).toBeGreaterThan(0);
    });

    it("should flag insecure http:// links", () => {
      const report = NewsletterSpamAnalyzer.analyze({
        subject: "Weekly Architecture Summary",
        previewText: "Overview of current architectures",
        content:
          '<p>Check out our site at <a href="http://unsecure-insecure-site.com">Click</a></p>',
      });

      const linkCheck = report.checks.find((c) => c.id === "link_security");
      expect(linkCheck?.passed).toBe(false);
    });
  });

  describe("Audience Recipient Resolver (newsletter.recipient.ts)", () => {
    it("should resolve custom email inclusions and exclusions correctly", async () => {
      const { recipients, stats } =
        await NewsletterRecipientResolver.resolveRecipients({
          targetAudience: "CUSTOM",
          includedEmails: [
            "included1@example.com",
            "included2@example.com",
            "suppressed@example.com",
          ],
          excludedEmails: ["suppressed@example.com"],
        });

      const emailList = recipients.map((r) => r.email);
      expect(emailList).toContain("included1@example.com");
      expect(emailList).toContain("included2@example.com");
      expect(emailList).not.toContain("suppressed@example.com");

      expect(stats.totalCount).toBe(2);
      expect(stats.excludedCount).toBe(1);
    });
  });

  describe("Newsletter Dispatcher & Unsubscribe HMAC (newsletter.dispatcher.ts)", () => {
    it("should generate valid signed unsubscribe links", () => {
      const testEmail = "subscriber@example.com";
      const url = NewsletterDispatcher.buildUnsubscribeUrl(testEmail);

      expect(url).toContain("/unsubscribe?token=");
      expect(url).toMatch(/^https?:\/\//);
    });

    it("should dispatch test emails successfully in simulated mode", async () => {
      const result = await NewsletterDispatcher.sendTest({
        subject: "Unit Test Broadcast Subject",
        previewText: "Unit test preheader snippet",
        content: "<p>This is a unit test email payload.</p>",
        testEmails: ["tester1@example.com", "tester2@example.com"],
      });

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.recipients).toEqual([
        "tester1@example.com",
        "tester2@example.com",
      ]);
    });
  });

  describe("Plunk Campaigns API Integration (PlunkCampaignService.ts)", () => {
    const { PlunkCampaignService } = require("@/services/PlunkCampaignService");

    it("should create a Plunk campaign in simulated/live mode", async () => {
      const campaign = await PlunkCampaignService.createCampaign({
        name: "Plunk Test Campaign",
        subject: "Plunk Test Subject",
        body: "<p>Plunk Test HTML Body</p>",
        from: "fi@amanillah.com",
        fromName: "Fi Amanillah",
        audienceType: "ALL",
        type: "MARKETING",
      });

      expect(campaign.id).toBeDefined();
      expect(campaign.name).toBe("Plunk Test Campaign");
      expect(campaign.status).toBe("DRAFT");
      expect(campaign.audienceType).toBe("ALL");
    });

    it("should send or schedule a Plunk campaign", async () => {
      const created = await PlunkCampaignService.createCampaign({
        name: "Broadcast Test",
        subject: "Broadcast Subject",
        body: "<p>Broadcast Body</p>",
        from: "fi@amanillah.com",
        audienceType: "ALL",
      });

      const sent = await PlunkCampaignService.sendCampaign(created.id, {});
      expect(sent.status).toBe("SENDING");
    });

    it("should dispatch a test email for a Plunk campaign", async () => {
      const created = await PlunkCampaignService.createCampaign({
        name: "Test Send Campaign",
        subject: "Test Send Subject",
        body: "<p>Test Send Body</p>",
        from: "fi@amanillah.com",
        audienceType: "ALL",
      });

      const testResult = await PlunkCampaignService.testCampaign(
        created.id,
        "recipient@example.com"
      );
      expect(testResult.success).toBe(true);
    });

    it("should duplicate a Plunk campaign", async () => {
      const created = await PlunkCampaignService.createCampaign({
        name: "Original Campaign",
        subject: "Original Subject",
        body: "<p>Original Body</p>",
        from: "fi@amanillah.com",
        audienceType: "ALL",
      });

      const duplicated = await PlunkCampaignService.duplicateCampaign(created.id);
      expect(duplicated.id).toBeDefined();
      expect(duplicated.id).not.toBe(created.id);
    });
  });
});
