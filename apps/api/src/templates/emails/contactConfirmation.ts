// src/templates/emails/contactConfirmation.ts
import { renderEmailLayout } from "./baseLayout"

export interface ContactConfirmationOptions {
  name?: string
  email?: string
  subject?: string
  message?: string
  subscribed?: boolean
  unsubscribeUrl?: string
  manageUrl?: string
}

/**
 * Returns the raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getContactConfirmationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      Thanks for reaching out. I have received your message regarding &ldquo;<strong style="color: #0f172a;">{{ subject | default: 'Your Inquiry' }}</strong>&rdquo; and will get back to you shortly.
    </p>

    <!-- Message Summary Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 16px 18px;">
      <p style="margin: 0 0 6px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        YOUR MESSAGE
      </p>
      <div style="white-space: pre-wrap; font-size: 13px; color: #334155; line-height: 1.6;">
        {{ message | default: '(No message body provided)' }}
      </div>
    </div>

    {% if subscribed %}
    <p style="margin: 0 0 16px 0; font-size: 13px; color: #334155; line-height: 1.5;">
      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #047857; background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 2px 6px; border-radius: 0; display: inline-block; margin-right: 6px;">[SUBSCRIBED]</span>
      You are also subscribed to my engineering newsletter and project updates.
    </p>
    {% endif %}

    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
      If your note is urgent, you can also reply directly to this email.
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Best regards,<br>
        <strong style="color: #0f172a;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Confirmation",
    title: "Thank you for getting in touch",
    subtitle: "Your message has been received and queued for review",
    contentHtml,
    previewText:
      "Hi {{ name | default: 'there' }}, thank you for getting in touch. Your message has been received.",
    unsubscribeUrl: "{{ unsubscribeUrl }}",
    manageUrl: "{{ manageUrl }}",
    showUnsubscribe: true,
  })

  return html
}

/**
 * Renders the Confirmation Email with concrete runtime values.
 */
export function renderContactConfirmationEmail(
  options: ContactConfirmationOptions
): {
  subject: string
  html: string
  listUnsubscribeHeader: string
} {
  const {
    name,
    email,
    subject: userSubject,
    message,
    subscribed,
    unsubscribeUrl,
    manageUrl,
  } = options
  const displayName = name && name.trim().length > 0 ? name.trim() : "there"
  const safeSubject =
    userSubject && userSubject.trim().length > 0
      ? userSubject.trim()
      : "Your Inquiry"
  const safeMessage = message || ""
  const emailSubject = `[Confirmation] Thank you for getting in touch - Fi Amanillah`

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>${displayName}</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      Thanks for reaching out. I have received your message regarding &ldquo;<strong style="color: #0f172a;">${safeSubject}</strong>&rdquo; and will get back to you shortly.
    </p>

    <!-- Message Summary Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 16px 18px;">
      <p style="margin: 0 0 6px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        YOUR MESSAGE
      </p>
      <div style="white-space: pre-wrap; font-size: 13px; color: #334155; line-height: 1.6;">
        ${safeMessage}
      </div>
    </div>

    ${
      subscribed
        ? `<p style="margin: 0 0 16px 0; font-size: 13px; color: #334155; line-height: 1.5;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #047857; background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 2px 6px; border-radius: 0; display: inline-block; margin-right: 6px;">[SUBSCRIBED]</span>
            You are also subscribed to my engineering newsletter and project updates.
          </p>`
        : ""
    }

    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
      If your note is urgent, you can also reply directly to this email.
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Best regards,<br>
        <strong style="color: #0f172a;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "Confirmation",
    title: "Thank you for getting in touch",
    subtitle: "Your message has been received and queued for review",
    contentHtml,
    previewText: `Hi ${displayName}, thank you for reaching out to Fi Amanillah. Your message has been received.`,
    unsubscribeUrl: subscribed ? unsubscribeUrl : undefined,
    manageUrl,
    showUnsubscribe: !!subscribed,
  })

  return { subject: emailSubject, html, listUnsubscribeHeader }
}
