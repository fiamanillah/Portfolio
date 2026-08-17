// src/templates/emails/subscriptionConfirmation.ts
import { renderEmailLayout } from "./baseLayout"

export interface SubscriptionConfirmationOptions {
  email: string
  name?: string
  source?: string
  unsubscribeUrl?: string
  manageUrl?: string
}

/**
 * Returns the raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getSubscriptionConfirmationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      You are now subscribed to my engineering newsletter. I regularly share detailed architecture breakdowns, full-stack case studies, open-source releases, and engineering notes.
    </p>

    <!-- Subscribed Details Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 16px 18px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        SUBSCRIBED ADDRESS
      </p>
      <p style="margin: 0; font-size: 14px; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600;">
        {{ email }}
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: #334155; line-height: 1.65;">
      Feel free to explore recent deep-dives and projects on my engineering blog:
    </p>

    <div style="margin: 22px 0; text-align: left;">
      <a href="https://fi.amanillah.com/blog" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
        Read Engineering Blog -&gt;
      </a>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Glad to have you along,<br>
        <strong style="color: #0f172a;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Welcome",
    title: "You are subscribed to updates",
    subtitle: "Architecture deep-dives, systems design and open-source releases",
    contentHtml,
    previewText:
      "Hi {{ name | default: 'there' }} — welcome to Fi Amanillah's engineering newsletter.",
    unsubscribeUrl: "{{ unsubscribeUrl }}",
    manageUrl: "{{ manageUrl }}",
    showUnsubscribe: true,
  })

  return html
}

/**
 * Renders the Welcome / Subscription Confirmation Email with concrete values.
 */
export function renderSubscriptionConfirmationEmail(
  options: SubscriptionConfirmationOptions
): {
  subject: string
  html: string
  listUnsubscribeHeader: string
} {
  const { email, name, unsubscribeUrl, manageUrl } = options
  const displayName = name && name.trim().length > 0 ? name.trim() : "there"
  const emailSubject = `You are subscribed — Fi Amanillah`

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>${displayName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      You are now subscribed to my engineering newsletter. I regularly share detailed architecture breakdowns, full-stack case studies, open-source releases, and engineering notes.
    </p>

    <!-- Subscribed Details Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 16px 18px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        SUBSCRIBED ADDRESS
      </p>
      <p style="margin: 0; font-size: 14px; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600;">
        ${email}
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: #334155; line-height: 1.65;">
      Feel free to explore recent deep-dives and projects on my engineering blog:
    </p>

    <div style="margin: 22px 0; text-align: left;">
      <a href="https://fi.amanillah.com/blog" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
        Read Engineering Blog -&gt;
      </a>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Glad to have you along,<br>
        <strong style="color: #0f172a;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "Welcome",
    title: "You are subscribed to updates",
    subtitle: "Architecture deep-dives, systems design and open-source releases",
    contentHtml,
    previewText: `Hi ${displayName} — welcome to Fi Amanillah's engineering newsletter.`,
    unsubscribeUrl,
    manageUrl,
    showUnsubscribe: true,
  })

  return { subject: emailSubject, html, listUnsubscribeHeader }
}
