// apps/dashboard/src/lib/email-layout.ts
import { marked } from "marked";

export interface EmailLayoutOptions {
  title: string;
  subtitle?: string | null;
  badgeLabel?: string;
  content: string;
  previewText?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
  manageUrl?: string;
  sampleRecipient?: {
    name?: string;
    firstName?: string;
    email?: string;
  };
}

export interface RenderedEmailResult {
  html: string;
  interpolatedSubject: string;
  interpolatedPreview: string;
  interpolatedContent: string;
  senderName: string;
  senderEmail: string;
}

/**
 * Standard default recipient context for simulation.
 */
export const DEFAULT_PREVIEW_RECIPIENT = {
  name: "Alex Johnson",
  firstName: "Alex",
  email: "alex.johnson@example.com",
};

/**
 * Available simulation personas for testing in the preview.
 */
export const PREVIEW_PERSONAS = [
  {
    id: "alex",
    label: "Alex Johnson (Tech Lead)",
    name: "Alex Johnson",
    firstName: "Alex",
    email: "alex.johnson@example.com",
  },
  {
    id: "sarah",
    label: "Sarah Connor (Architect)",
    name: "Sarah Connor",
    firstName: "Sarah",
    email: "sarah@cyberdyne.io",
  },
  {
    id: "subscriber",
    label: "Anonymous Subscriber",
    name: "",
    firstName: "",
    email: "subscriber@newsletter.dev",
  },
];

/**
 * Simulates Liquid template variable parsing and substitution with fallback defaults.
 * Supports:
 *  - {{ name | default: firstName | default: 'there' }}
 *  - {{ name | default: 'there' }}
 *  - {{ firstName }}
 *  - {{ email }}
 *  - {{ unsubscribeUrl }}
 *  - {{ manageUrl }}
 *  - {{ siteUrl }}
 *  - {{ year }}
 *  - {% if tag %} ... {% endif %}
 */
export function interpolateLiquidVariables(
  text: string,
  context: {
    name?: string;
    firstName?: string;
    email?: string;
    unsubscribeUrl?: string;
    manageUrl?: string;
    siteUrl?: string;
    year?: number | string;
    [key: string]: unknown;
  }
): string {
  if (!text) return "";

  const name = context.name || "";
  const firstName =
    context.firstName || (name ? name.split(" ")[0] : "") || "";
  const email = context.email || "subscriber@example.com";
  const unsubscribeUrl =
    context.unsubscribeUrl ||
    "https://fi.amanillah.com/unsubscribe?token=preview_sample";
  const manageUrl =
    context.manageUrl || "https://fi.amanillah.com/preferences";
  const siteUrl = context.siteUrl || "https://fi.amanillah.com";
  const year = context.year || new Date().getFullYear();

  let rendered = text;

  // Handle {% if ... %} {% endif %} blocks simply
  rendered = rendered.replace(
    /\{%\s*if\s+([a-zA-Z0-9_]+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
    (_, varName, inner) => {
      const val = context[varName];
      return val ? inner : "";
    }
  );

  // Handle complex fallback filters: {{ name | default: firstName | default: 'fallback' }}
  rendered = rendered.replace(
    /\{\{\s*name\s*\|\s*default:\s*firstName\s*\|\s*default:\s*(?:'([^']*)'|"([^"]*)")\s*\}\}/gi,
    (_, f1, f2) => {
      const fallback = f1 ?? f2 ?? "there";
      return name || firstName || fallback;
    }
  );

  // Handle standard fallbacks: {{ key | default: 'fallback' }}
  rendered = rendered.replace(
    /\{\{\s*([a-zA-Z0-9_.]+)\s*\|\s*default:\s*(?:'([^']*)'|"([^"]*)")\s*\}\}/gi,
    (_, key, f1, f2) => {
      const fallback = f1 ?? f2 ?? "";
      if (key === "name") return name || fallback;
      if (key === "firstName") return firstName || fallback;
      if (key === "email") return email || fallback;
      if (key === "unsubscribeUrl") return unsubscribeUrl || fallback;
      if (key === "manageUrl") return manageUrl || fallback;
      if (key === "siteUrl") return siteUrl || fallback;
      if (key === "year") return String(year) || fallback;
      return context[key] !== undefined ? String(context[key]) : fallback;
    }
  );

  // Handle simple tokens: {{ key }}
  rendered = rendered.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    if (key === "name") return name || "there";
    if (key === "firstName") return firstName || "there";
    if (key === "email") return email;
    if (key === "unsubscribeUrl") return unsubscribeUrl;
    if (key === "manageUrl") return manageUrl;
    if (key === "siteUrl") return siteUrl;
    if (key === "year") return String(year);
    return context[key] !== undefined ? String(context[key]) : `{{ ${key} }}`;
  });

  return rendered;
}

/**
 * Checks if a string contains HTML elements.
 */
function isHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Formats body content for email clients.
 * If raw markdown is passed, converts it to styled email HTML.
 * If HTML is already present, preserves HTML while ensuring clean paragraph spacing.
 */
export function formatEmailBodyContent(content: string): string {
  if (!content || !content.trim()) {
    return `<p style="margin: 0 0 16px 0; color: #64748b; font-style: italic;">(Newsletter content is empty...)</p>`;
  }

  // If content contains full HTML markup (like <p>, <div>, <table>), render as is
  if (isHtml(content)) {
    return content;
  }

  // Otherwise, parse markdown to HTML
  try {
    const rawParsed = marked.parse(content, { async: false, gfm: true }) as string;
    // Add email-friendly inline style defaults
    return rawParsed
      .replace(/<p>/g, '<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65; font-size: 14px;">')
      .replace(/<h1>/g, '<h1 style="margin: 24px 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">')
      .replace(/<h2>/g, '<h2 style="margin: 22px 0 10px 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.35;">')
      .replace(/<h3>/g, '<h3 style="margin: 20px 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.4;">')
      .replace(/<a\s+href=/g, '<a style="color: #0f172a; font-weight: 600; text-decoration: underline;" href=')
      .replace(/<ul>/g, '<ul style="margin: 0 0 18px 0; padding-left: 20px; color: #334155; line-height: 1.65; font-size: 14px;">')
      .replace(/<ol>/g, '<ol style="margin: 0 0 18px 0; padding-left: 20px; color: #334155; line-height: 1.65; font-size: 14px;">')
      .replace(/<li>/g, '<li style="margin-bottom: 6px;">')
      .replace(/<blockquote>/g, '<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #0f172a; background-color: #f8fafc; color: #475569; font-style: italic;">')
      .replace(/<code>/g, '<code style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 4px;">')
      .replace(/<pre>/g, '<pre style="margin: 16px 0; padding: 14px; background-color: #0f172a; color: #f8fafc; overflow-x: auto; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.5;">')
      .replace(/<hr\s*\/?>/g, '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />');
  } catch {
    return content;
  }
}

/**
 * Renders the full, authentic site email layout identical to apps/api/src/templates/emails/baseLayout.ts.
 */
export function renderSiteEmailLayout(
  options: EmailLayoutOptions
): RenderedEmailResult {
  const {
    title,
    subtitle,
    badgeLabel = "NEWSLETTER",
    content,
    previewText = "",
    senderName,
    senderEmail,
    showUnsubscribe = true,
    unsubscribeUrl = "https://fi.amanillah.com/unsubscribe?token=preview_sample",
    manageUrl = "https://fi.amanillah.com",
    sampleRecipient = DEFAULT_PREVIEW_RECIPIENT,
  } = options;

  const fontSans =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  const fontMono =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

  const resolvedSenderName = senderName?.trim() || "Fi Amanillah";
  const resolvedSenderEmail =
    senderEmail?.trim() || "newsletter@newsletter.amanillah.com";

  // Interpolate variables with recipient context
  const context = {
    ...sampleRecipient,
    unsubscribeUrl,
    manageUrl,
    siteUrl: "https://fi.amanillah.com",
    year: new Date().getFullYear(),
  };

  const rawSubject = title || "Untitled Newsletter";
  const rawPreview = previewText || subtitle || "";
  const rawContent = formatEmailBodyContent(content);

  const interpolatedSubject = interpolateLiquidVariables(rawSubject, context);
  const interpolatedPreview = interpolateLiquidVariables(rawPreview, context);
  const interpolatedContent = interpolateLiquidVariables(rawContent, context);
  const interpolatedSubtitle = subtitle
    ? interpolateLiquidVariables(subtitle, context)
    : "";

  let footerLinksHtml = "";
  if (showUnsubscribe) {
    if (unsubscribeUrl) {
      footerLinksHtml = `
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          You received this email because you subscribed or submitted a message on <a href="https://fi.amanillah.com" style="color: #64748b; text-decoration: underline;">fi.amanillah.com</a>.
        </p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
          <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
          ${manageUrl ? `&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${manageUrl}" style="color: #64748b; text-decoration: underline;">Preferences</a>` : ""}
        </p>
      `;
    } else {
      footerLinksHtml = `
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          This is an automated transmission from <a href="https://fi.amanillah.com" style="color: #64748b; text-decoration: underline;">fi.amanillah.com</a>.
          If you did not initiate this request, you can safely disregard it.
        </p>
      `;
    }
  }

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
  <title>${interpolatedSubject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      .email-content {
        padding: 16px 20px 24px 20px !important;
      }
      .email-header {
        padding: 16px 20px 14px 20px !important;
      }
      .email-title-section {
        padding: 20px 20px 6px 20px !important;
      }
      .email-footer {
        padding: 20px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ${fontSans}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #334155;">
  <!-- Hidden preheader text snippet for inbox preview -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f8fafc;">
    ${interpolatedPreview}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 36px 16px; border-collapse: collapse;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table class="email-container" role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; border-collapse: collapse;">
          
          <!-- Header Bar with Logo and Monospace Badge -->
          <tr>
            <td class="email-header" style="padding: 20px 32px 16px 32px; border-bottom: 1px solid #e2e8f0; border-radius: 0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <a href="https://fi.amanillah.com" target="_blank" style="text-decoration: none; display: block;">
                            <img 
                              src="https://assets.fi.amanillah.com/general/2026/08/logo-25d8b825.png" 
                              alt="Fi Amanillah" 
                              height="26" 
                              style="display: block; height: 26px; width: auto; max-height: 26px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                            />
                          </a>
                        </td>
                        ${
                          badgeLabel
                            ? `<td style="vertical-align: middle;">
                                <span style="font-family: ${fontMono}; font-size: 10px; font-weight: 700; color: #475569; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 7px; border-radius: 0; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
                                  ${badgeLabel}
                                </span>
                              </td>`
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="https://fi.amanillah.com" target="_blank" style="font-family: ${fontMono}; font-size: 11px; color: #94a3b8; text-decoration: none; font-weight: 500;">
                      fi.amanillah.com &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td class="email-title-section" style="padding: 24px 32px 6px 32px; border-radius: 0;">
              <h1 style="margin: 0 0 6px 0; font-family: ${fontSans}; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; line-height: 1.3;">
                ${interpolatedSubject}
              </h1>
              ${
                interpolatedSubtitle
                  ? `<p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">${interpolatedSubtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="email-content" style="padding: 14px 32px 28px 32px; color: #334155; font-size: 14px; line-height: 1.65; border-radius: 0;">
              ${interpolatedContent}
            </td>
          </tr>

          <!-- Unified Clean Footer -->
          <tr>
            <td class="email-footer" style="padding: 22px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                      ${resolvedSenderName} <span style="font-weight: 400; color: #64748b;">&mdash; Full Stack Developer</span>
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">
                      <a href="https://fi.amanillah.com" style="color: #475569; text-decoration: underline; margin-right: 12px;">Home</a>
                      <a href="https://fi.amanillah.com/blog" style="color: #475569; text-decoration: underline; margin-right: 12px;">Blog</a>
                      <a href="https://github.com/fiamanillah" style="color: #475569; text-decoration: underline; margin-right: 12px;">GitHub</a>
                      <a href="https://www.linkedin.com/in/fi-amanillah/" style="color: #475569; text-decoration: underline;">LinkedIn</a>
                    </p>
                    ${footerLinksHtml}
                  </td>
                </tr>
              </table>
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
    interpolatedSubject,
    interpolatedPreview,
    interpolatedContent,
    senderName: resolvedSenderName,
    senderEmail: resolvedSenderEmail,
  };
}
