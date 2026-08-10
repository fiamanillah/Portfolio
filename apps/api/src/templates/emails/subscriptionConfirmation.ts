// src/templates/emails/subscriptionConfirmation.ts
import { renderEmailLayout } from "./baseLayout";

export interface SubscriptionConfirmationOptions {
  email: string;
  name?: string;
  source?: string;
  unsubscribeUrl?: string;
}

/**
 * Renders the short, professional Welcome & Subscription Confirmation Email.
 */
export function renderSubscriptionConfirmationEmail(options: SubscriptionConfirmationOptions): {
  subject: string;
  html: string;
  listUnsubscribeHeader: string;
} {
  const { email, name, source = "website", unsubscribeUrl } = options;
  const displayName = name ? name.trim() : "there";
  const subject = `You're subscribed — Fi Amanillah`;

  const contentHtml = `
    <p style="margin: 0 0 18px 0; font-size: 15px; color: #f8fafc;">Hi <strong>${displayName}</strong>,</p>

    <p style="margin: 0 0 18px 0; color: #cbd5e1; line-height: 1.7;">
      You're now subscribed to my newsletter. I'll occasionally send you updates on new projects,
      system design write-ups, and open-source releases — no noise, no spam.
    </p>

    <!-- Divider -->
    <div style="height: 1px; background-color: #1a273e; margin: 20px 0;"></div>

    <p style="margin: 0 0 6px 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.08em;">
      Subscribed as
    </p>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #f8fafc; font-family: 'Courier New', Courier, monospace;">
      ${email}
    </p>

    ${
      unsubscribeUrl
        ? `<p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
        Changed your mind? <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe instantly</a> — no questions asked.
      </p>`
        : ""
    }

    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #1a273e;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        — <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim();

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "NEWSLETTER_CONFIRMATION",
    title: "You're subscribed.",
    subtitle: "Updates & case studies from Fi Amanillah",
    contentHtml,
    previewText: `Hi ${displayName} — you're now subscribed to Fi Amanillah's newsletter.`,
    unsubscribeUrl,
  });

  return { subject, html, listUnsubscribeHeader };
}
