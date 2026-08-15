// src/templates/emails/contactNotification.ts
import { renderEmailLayout } from "./baseLayout";

export interface ContactNotificationOptions {
  name: string;
  email: string;
  subject?: string;
  message: string;
  subscribed?: boolean;
}

/**
 * Returns the raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getContactNotificationLiquidBody(): string {
  const contentHtml = `
    <!-- Contact Info Card -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #131c31; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px;">
          <strong style="color: #94a3b8; display: inline-block; width: 80px;">From:</strong>
          <span style="color: #f1f5f9; font-weight: 500;">{{ name }}</span>
          <span style="color: #64748b;">(&lt;<a href="mailto:{{ email }}" style="color: #06b6d4; text-decoration: none;">{{ email }}</a>&gt;)</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px;">
          <strong style="color: #94a3b8; display: inline-block; width: 80px;">Subject:</strong>
          <span style="color: #f1f5f9;">{{ subject | default: '(No Subject)' }}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-size: 13px;">
          <strong style="color: #94a3b8; display: inline-block; width: 80px;">Newsletter:</strong>
          {% if subscribed %}
            <span style="color: #10b981; font-weight: 600;">Yes, Opted In</span>
          {% else %}
            <span style="color: #64748b;">No</span>
          {% endif %}
        </td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="margin: 20px 0; background-color: #131c31; border-left: 3px solid #06b6d4; border-radius: 0 6px 6px 0; padding: 16px 18px;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.06em;">
        Message Content
      </p>
      <div style="white-space: pre-wrap; font-size: 14px; color: #e2e8f0; line-height: 1.65;">
        {{ message }}
      </div>
    </div>

    <!-- Direct Reply Action -->
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #1e293b; text-align: left;">
      <a href="mailto:{{ email }}?subject=Re:%20{{ subject | url_encode }}" style="display: inline-block; background-color: #06b6d4; color: #090d16; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
        Reply to {{ name }} →
      </a>
    </div>
  `.trim();

  const { html } = renderEmailLayout({
    badgeLabel: "New Contact Message",
    title: "New Contact Message",
    subtitle: "Submission received from portfolio contact form",
    contentHtml,
    previewText: "New message from {{ name }} ({{ email }}): {{ subject | default: '(No Subject)' }}",
    showUnsubscribe: false,
  });

  return html;
}

/**
 * Renders the Admin Notification Email with concrete runtime values.
 */
export function renderContactNotificationEmail(options: ContactNotificationOptions): {
  subject: string;
  html: string;
} {
  const { name, email, subject: userSubject, message, subscribed } = options;
  const safeSubject = userSubject && userSubject.trim().length > 0 ? userSubject.trim() : "No Subject";
  const emailSubject = `[Portfolio Contact] ${safeSubject} — from ${name}`;

  const contentHtml = `
    <!-- Contact Info Card -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #131c31; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px;">
          <strong style="color: #94a3b8; display: inline-block; width: 80px;">From:</strong>
          <span style="color: #f1f5f9; font-weight: 500;">${name}</span>
          <span style="color: #64748b;">(&lt;<a href="mailto:${email}" style="color: #06b6d4; text-decoration: none;">${email}</a>&gt;)</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px;">
          <strong style="color: #94a3b8; display: inline-block; width: 80px;">Subject:</strong>
          <span style="color: #f1f5f9;">${safeSubject}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-size: 13px;">
          <strong style="color: #94a3b8; display: inline-block; width: 80px;">Newsletter:</strong>
          <span style="color: ${subscribed ? '#10b981' : '#64748b'}; font-weight: ${subscribed ? '600' : '400'};">
            ${subscribed ? 'Yes, Opted In' : 'No'}
          </span>
        </td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="margin: 20px 0; background-color: #131c31; border-left: 3px solid #06b6d4; border-radius: 0 6px 6px 0; padding: 16px 18px;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.06em;">
        Message Content
      </p>
      <div style="white-space: pre-wrap; font-size: 14px; color: #e2e8f0; line-height: 1.65;">
        ${message}
      </div>
    </div>

    <!-- Direct Reply Action -->
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #1e293b; text-align: left;">
      <a href="mailto:${email}?subject=${encodeURIComponent('Re: ' + safeSubject)}" style="display: inline-block; background-color: #06b6d4; color: #090d16; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
        Reply to ${name} →
      </a>
    </div>
  `.trim();

  const { html } = renderEmailLayout({
    badgeLabel: "New Contact Message",
    title: "New Contact Message",
    subtitle: `Received message from ${name}`,
    contentHtml,
    previewText: `New portfolio contact message from ${name} (${email}): ${safeSubject}`,
    showUnsubscribe: false,
  });

  return { subject: emailSubject, html };
}
