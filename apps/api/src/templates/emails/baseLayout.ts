// src/templates/emails/baseLayout.ts

export interface EmailLayoutOptions {
  badgeLabel?: string
  title: string
  subtitle?: string
  contentHtml: string
  previewText?: string
  unsubscribeUrl?: string
  manageUrl?: string
  showUnsubscribe?: boolean
}

export interface EmailLayoutResult {
  html: string
  listUnsubscribeHeader: string
}

/**
 * Clean, Minimalist & Modern Email Layout matching Fi Amanillah's Portfolio.
 * Refined typography, subtle borders, sleek buttons, and resilient HTML tables.
 */
export function renderEmailLayout(
  options: EmailLayoutOptions
): EmailLayoutResult {
  const {
    badgeLabel,
    title,
    subtitle,
    contentHtml,
    previewText = title,
    unsubscribeUrl,
    manageUrl,
    showUnsubscribe = true,
  } = options

  const fontSans =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  const fontMono =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

  let footerLinksHtml = ""
  if (showUnsubscribe) {
    if (unsubscribeUrl) {
      footerLinksHtml = `
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          You received this email because you subscribed or submitted a message on <a href="https://fi.amanillah.com" style="color: #94a3b8; text-decoration: underline;">fi.amanillah.com</a>.
        </p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">
          <a href="${unsubscribeUrl}" style="color: #06b6d4; text-decoration: none;">Unsubscribe</a>
          ${manageUrl ? `&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${manageUrl}" style="color: #64748b; text-decoration: none;">Preferences</a>` : ""}
        </p>
      `
    } else {
      footerLinksHtml = `
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          This is a transactional transmission from <a href="https://fi.amanillah.com" style="color: #94a3b8; text-decoration: underline;">fi.amanillah.com</a>.
          If you did not make this request, you can safely disregard it.
        </p>
      `
    }
  }

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 24px 20px !important;
      }
      .email-content {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: ${fontSans}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #cbd5e1;">
  <!-- Preview text snippet for inbox list -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #090d16;">
    ${previewText}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);">
          
          <!-- Header Bar with Logo and Brand -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <a href="https://fi.amanillah.com" style="text-decoration: none; display: inline-flex; align-items: center;">
                            <span style="font-family: ${fontSans}; font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">
                              Fi Amanillah
                            </span>
                          </a>
                        </td>
                        ${
                          badgeLabel
                            ? `<td style="padding-left: 10px; vertical-align: middle;">
                                <span style="font-family: ${fontMono}; font-size: 10px; font-weight: 600; color: #06b6d4; background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); padding: 2px 7px; border-radius: 9999px; display: inline-block;">
                                  ${badgeLabel}
                                </span>
                              </td>`
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="https://fi.amanillah.com" style="font-size: 12px; color: #64748b; text-decoration: none; font-weight: 500;">
                      Portfolio →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <h1 style="margin: 0 0 6px 0; font-family: ${fontSans}; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; line-height: 1.3;">
                ${title}
              </h1>
              ${
                subtitle
                  ? `<p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">${subtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="email-content" style="padding: 16px 32px 32px 32px; color: #cbd5e1; font-size: 14px; line-height: 1.7;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Clean Minimal Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #e2e8f0;">
                      Fi Amanillah
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">
                      Full-Stack &amp; DevOps Engineer · Building robust backend systems
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      <a href="https://fi.amanillah.com" style="color: #94a3b8; text-decoration: none; margin-right: 12px;">Home</a>
                      <a href="https://fi.amanillah.com/blog" style="color: #94a3b8; text-decoration: none; margin-right: 12px;">Blog</a>
                      <a href="https://github.com/fiamanillah" style="color: #94a3b8; text-decoration: none; margin-right: 12px;">GitHub</a>
                      <a href="https://www.linkedin.com/in/fi-amanillah/" style="color: #94a3b8; text-decoration: none;">LinkedIn</a>
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
  `.trim()

  return {
    html,
    listUnsubscribeHeader: unsubscribeUrl ? `<${unsubscribeUrl}>` : "",
  }
}
