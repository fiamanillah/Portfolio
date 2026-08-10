// src/templates/emails/contactNotification.ts
import { renderEmailLayout } from "./baseLayout";

export interface ContactNotificationOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribed?: boolean;
}

/**
 * Renders the Admin Notification Email sent to the portfolio owner on new contact form submissions.
 */
export function renderContactNotificationEmail(options: ContactNotificationOptions): {
  subject: string;
  html: string;
} {
  const { name, email, subject: userSubject, message, subscribed } = options;
  const subject = userSubject
    ? `[Portfolio Contact] ${userSubject}`
    : `[Portfolio Contact] Message from ${name}`;

  const contentHtml = `
    <!-- Contact Info Block -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #0f172a; border: 1px solid #1f2d48; border-radius: 6px; padding: 16px;">
      <tr>
        <td>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #cbd5e1;"><strong>From:</strong> ${name} (&lt;<a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a>&gt;)</p>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #cbd5e1;"><strong>Subject:</strong> ${userSubject || "No Subject"}</p>
          <p style="margin: 0; font-size: 13px; color: #cbd5e1;"><strong>Subscribed to Newsletter:</strong> <span style="color: ${subscribed ? '#10b981' : '#94a3b8'}; font-weight: 700;">${subscribed ? 'Yes' : 'No'}</span></p>
        </td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="margin: 20px 0; background-color: #0d1322; border-left: 3px solid #10b981; border-radius: 0 6px 6px 0; padding: 16px;">
      <p style="margin: 0 0 8px 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.08em;">
        MESSAGE CONTENT
      </p>
      <div style="white-space: pre-wrap; font-size: 14px; color: #e2e8f0; line-height: 1.6;">${message}</div>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1a273e; text-align: center;">
      <a href="mailto:${email}?subject=${encodeURIComponent('Re: ' + (userSubject || 'Your Portfolio Inquiry'))}" style="display: inline-block; background-color: #10b981; color: #090d16; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 20px; border-radius: 4px; text-decoration: none;">
        Reply to ${name}
      </a>
    </div>
  `.trim();

  const { html } = renderEmailLayout({
    badgeLabel: "CONTACT_TRANSMISSION",
    title: "New Contact Form Message",
    subtitle: `Received submission from ${name}`,
    contentHtml,
    previewText: `New portfolio contact message from ${name} (${email}): ${userSubject}`,
  });

  return { subject, html };
}
