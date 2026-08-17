// src/templates/emails/contactNotification.ts
import { renderEmailLayout } from "./baseLayout"

export interface ContactNotificationOptions {
  name: string
  email: string
  subject?: string
  message: string
  subscribed?: boolean
}

/**
 * Returns the raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getContactNotificationLiquidBody(): string {
  const contentHtml = `
    <!-- Contact Info Card -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0;">
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #64748b; text-transform: uppercase; display: inline-block; width: 100px;">From:</strong>
          <span style="color: #0f172a; font-weight: 600;">{{ name }}</span>
          <span style="color: #64748b;">(&lt;<a href="mailto:{{ email }}" style="color: #0f172a; text-decoration: underline;">{{ email }}</a>&gt;)</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #64748b; text-transform: uppercase; display: inline-block; width: 100px;">Subject:</strong>
          <span style="color: #0f172a;">{{ subject | default: '(No Subject)' }}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-size: 13px;">
          <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #64748b; text-transform: uppercase; display: inline-block; width: 100px;">Newsletter:</strong>
          {% if subscribed %}
            <span style="color: #047857; font-weight: 600;">Yes, Opted In</span>
          {% else %}
            <span style="color: #64748b;">No</span>
          {% endif %}
        </td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 16px 18px;">
      <p style="margin: 0 0 8px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        MESSAGE CONTENT
      </p>
      <div style="white-space: pre-wrap; font-size: 13px; color: #334155; line-height: 1.65;">
        {{ message }}
      </div>
    </div>

    <!-- Direct Reply Action -->
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: left;">
      <a href="mailto:{{ email }}?subject=Re:%20{{ subject | url_encode }}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
        Reply to {{ name }} -&gt;
      </a>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Notification",
    title: "New Contact Message",
    subtitle: "Submission received from portfolio contact form",
    contentHtml,
    previewText:
      "New message from {{ name }} ({{ email }}): {{ subject | default: '(No Subject)' }}",
    showUnsubscribe: false,
  })

  return html
}

/**
 * Renders the Admin Notification Email with concrete runtime values.
 */
export function renderContactNotificationEmail(
  options: ContactNotificationOptions
): {
  subject: string
  html: string
} {
  const { name, email, subject: userSubject, message, subscribed } = options
  const safeSubject =
    userSubject && userSubject.trim().length > 0
      ? userSubject.trim()
      : "No Subject"
  const emailSubject = `[Portfolio Contact] ${safeSubject} — from ${name}`

  const contentHtml = `
    <!-- Contact Info Card -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0;">
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #64748b; text-transform: uppercase; display: inline-block; width: 100px;">From:</strong>
          <span style="color: #0f172a; font-weight: 600;">${name}</span>
          <span style="color: #64748b;">(&lt;<a href="mailto:${email}" style="color: #0f172a; text-decoration: underline;">${email}</a>&gt;)</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #64748b; text-transform: uppercase; display: inline-block; width: 100px;">Subject:</strong>
          <span style="color: #0f172a;">${safeSubject}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-size: 13px;">
          <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #64748b; text-transform: uppercase; display: inline-block; width: 100px;">Newsletter:</strong>
          <span style="color: ${subscribed ? "#047857" : "#64748b"}; font-weight: ${subscribed ? "600" : "400"};">
            ${subscribed ? "Yes, Opted In" : "No"}
          </span>
        </td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 16px 18px;">
      <p style="margin: 0 0 8px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        MESSAGE CONTENT
      </p>
      <div style="white-space: pre-wrap; font-size: 13px; color: #334155; line-height: 1.65;">
        ${message}
      </div>
    </div>

    <!-- Direct Reply Action -->
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: left;">
      <a href="mailto:${email}?subject=${encodeURIComponent("Re: " + safeSubject)}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
        Reply to ${name} -&gt;
      </a>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Notification",
    title: "New Contact Message",
    subtitle: `Received message from ${name}`,
    contentHtml,
    previewText: `New portfolio contact message from ${name} (${email}): ${safeSubject}`,
    showUnsubscribe: false,
  })

  return { subject: emailSubject, html }
}
