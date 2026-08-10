// src/templates/emails/baseLayout.ts

export interface EmailLayoutOptions {
  badgeLabel?: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  previewText?: string;
  unsubscribeUrl?: string;
}

export interface EmailLayoutResult {
  html: string;
  listUnsubscribeHeader: string;
}

/**
 * Centralized Base Email Layout matching Fi Amanillah's Portfolio Design System.
 * Uses inline CSS for universal email client compatibility (Gmail, Outlook, Apple Mail).
 */
export function renderEmailLayout(options: EmailLayoutOptions): EmailLayoutResult {
  const {
    badgeLabel = "SYSTEM_NOTIFICATION",
    title,
    subtitle,
    contentHtml,
    previewText = title,
    unsubscribeUrl,
  } = options;

  const footerUnsubscribeHtml = unsubscribeUrl
    ? `<p style="margin: 12px 0 0 0; font-size: 11px; color: #475569; line-height: 1.5;">
        You're receiving this because you subscribed on <a href="https://amanillah.com" style="color: #64748b; text-decoration: underline;">amanillah.com</a>. &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </p>`
    : `<p style="margin: 12px 0 0 0; font-size: 11px; color: #475569; line-height: 1.5;">
        You received this email because of an interaction on <a href="https://amanillah.com" style="color: #64748b; text-decoration: underline;">amanillah.com</a>.<br>
        If you did not request this email, you can safely ignore it.
      </p>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Encoding" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Hidden preview text for inbox list -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #0b0f19;">
    ${previewText}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #131b2e; border: 1px solid #1f2d48; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Top Primary Accent Line -->
          <tr>
            <td style="height: 3px; background-color: #10b981;"></td>
          </tr>

          <!-- Header Branding Section -->
          <tr>
            <td style="padding: 24px 28px 16px 28px; border-bottom: 1px solid #1a273e;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; color: #10b981; letter-spacing: 0.12em; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 8px; border-radius: 2px; display: inline-block;">
                      [ ${badgeLabel} ]
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">
                      Fi Amanillah
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Banner Section -->
          <tr>
            <td style="padding: 24px 28px 12px 28px;">
              <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: #f8fafc; letter-spacing: -0.02em;">
                ${title}
              </h1>
              ${
                subtitle
                  ? `<p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">${subtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 12px 28px 28px 28px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 20px 28px; background-color: #0d1322; border-top: 1px solid #1a273e; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">
                FI AMANILLAH · FULL-STACK DEVELOPER &amp; ARCHITECT
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                <a href="https://github.com/fiamanillah" style="color: #10b981; text-decoration: none; margin: 0 6px;">GitHub</a> ·
                <a href="https://www.linkedin.com/in/fi-amanillah/" style="color: #10b981; text-decoration: none; margin: 0 6px;">LinkedIn</a> ·
                <a href="mailto:fi@amanillah.com" style="color: #10b981; text-decoration: none; margin: 0 6px;">fi@amanillah.com</a>
              </p>
              ${footerUnsubscribeHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    html,
    listUnsubscribeHeader: unsubscribeUrl ? `<${unsubscribeUrl}>` : "",
  };
}
