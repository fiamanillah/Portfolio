// src/templates/emails/contactConfirmation.ts
import { renderEmailLayout } from "./baseLayout";

export interface ContactConfirmationOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribed?: boolean;
  unsubscribeUrl?: string;
}

/**
 * Renders the Confirmation Email sent to users who submit a message via the Contact Form.
 */
export function renderContactConfirmationEmail(options: ContactConfirmationOptions): {
  subject: string;
  html: string;
  listUnsubscribeHeader: string;
} {
  const { name, email, subject: userSubject, message, subscribed, unsubscribeUrl } = options;
  const displayName = name ? name.trim() : "there";
  const subject = `[Confirmation] Thank you for getting in touch! - Fi Amanillah`;

  const contentHtml = `
    <p style="margin: 0 0 16px 0;">Hi <strong>${displayName}</strong>,</p>
    
    <p style="margin: 0 0 16px 0; color: #cbd5e1; line-height: 1.6;">
      Thank you for reaching out! I have received your message regarding "<strong>${userSubject}</strong>" and will review it as soon as possible.
    </p>

    <!-- Message Copy Box -->
    <div style="margin: 20px 0; background-color: #0f172a; border: 1px solid #1f2d48; border-radius: 6px; padding: 16px;">
      <p style="margin: 0 0 8px 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.08em;">
        COPY OF YOUR MESSAGE
      </p>
      <div style="white-space: pre-wrap; font-size: 13px; color: #94a3b8; line-height: 1.6;">${message}</div>
    </div>

    ${
      subscribed
        ? `<p style="margin: 0 0 16px 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #10b981;">✔ You have also been subscribed to my newsletter & project updates.</p>`
        : ""
    }

    <p style="margin: 0 0 16px 0; color: #cbd5e1; line-height: 1.6;">
      If your inquiry is urgent, feel free to reply directly to this email.
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1a273e;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        Best regards,<br>
        <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim();

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "MESSAGE_CONFIRMATION",
    title: "Thank You for Getting in Touch",
    subtitle: "Your message has been successfully received and queued for review",
    contentHtml,
    previewText: `Hi ${displayName}, thank you for reaching out to Fi Amanillah. Your message has been received!`,
    unsubscribeUrl: subscribed ? unsubscribeUrl : undefined,
  });

  return { subject, html, listUnsubscribeHeader };
}
