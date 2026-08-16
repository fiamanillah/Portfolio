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
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #f1f5f9;">
      Hi <strong style="color: #ffffff;">{{ name | default: firstName | default: 'there' }}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; color: #94a3b8; line-height: 1.7;">
      You're now subscribed to my newsletter. I regularly share detailed architecture breakdowns, full-stack case studies, open-source releases, and engineering notes.
    </p>

    <!-- Subscribed Details Box -->
    <div style="margin: 20px 0; background-color: #131c31; border: 1px solid #1e293b; border-radius: 8px; padding: 16px 18px;">
      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.06em;">
        Subscribed Address
      </p>
      <p style="margin: 0; font-size: 14px; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
        {{ email }}
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: #94a3b8; line-height: 1.7;">
      Feel free to explore recent deep-dives and projects on my engineering blog:
    </p>

    <div style="margin: 22px 0; text-align: left;">
      <a href="https://fi.amanillah.com/blog" style="display: inline-block; background-color: #06b6d4; color: #090d16; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
        Read Engineering Blog →
      </a>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        Glad to have you along,<br>
        <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Welcome",
    title: "You're subscribed to updates",
    subtitle: "Architecture deep-dives, systems design & open-source releases",
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
  const emailSubject = `You're subscribed — Fi Amanillah`

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #f1f5f9;">
      Hi <strong style="color: #ffffff;">${displayName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; color: #94a3b8; line-height: 1.7;">
      You're now subscribed to my newsletter. I regularly share detailed architecture breakdowns, full-stack case studies, open-source releases, and engineering notes.
    </p>

    <!-- Subscribed Details Box -->
    <div style="margin: 20px 0; background-color: #131c31; border: 1px solid #1e293b; border-radius: 8px; padding: 16px 18px;">
      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.06em;">
        Subscribed Address
      </p>
      <p style="margin: 0; font-size: 14px; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
        ${email}
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: #94a3b8; line-height: 1.7;">
      Feel free to explore recent deep-dives and projects on my engineering blog:
    </p>

    <div style="margin: 22px 0; text-align: left;">
      <a href="https://fi.amanillah.com/blog" style="display: inline-block; background-color: #06b6d4; color: #090d16; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
        Read Engineering Blog →
      </a>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        Glad to have you along,<br>
        <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "Welcome",
    title: "You're subscribed to updates",
    subtitle: "Architecture deep-dives, systems design & open-source releases",
    contentHtml,
    previewText: `Hi ${displayName} — welcome to Fi Amanillah's engineering newsletter.`,
    unsubscribeUrl,
    manageUrl,
    showUnsubscribe: true,
  })

  return { subject: emailSubject, html, listUnsubscribeHeader }
}
