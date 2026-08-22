// src/templates/emails/baseLayout.ts

export interface EmailLayoutOptions {
  title: string
  subtitle?: string
  badgeLabel?: string
  contentHtml: string
  previewText?: string
  showUnsubscribe?: boolean
  unsubscribeUrl?: string
  manageUrl?: string
  headExtraHtml?: string
}

export interface EmailLayoutResult {
  html: string
  listUnsubscribeHeader: string
}

/**
 * Core email layout renderer.
 * Produces clean, accessible, cross-client compatible HTML emails following modern best practices.
 * Features: square corners (border-radius: 0), crisp typography, balanced spacing, Full Stack Developer designation.
 */
export function renderEmailLayout(
  options: EmailLayoutOptions
): EmailLayoutResult {
  const {
    title,
    subtitle,
    badgeLabel,
    contentHtml,
    previewText = "",
    showUnsubscribe = false,
    unsubscribeUrl,
    manageUrl,
    headExtraHtml = "",
  } = options

  const fontSans =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  const fontMono =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"

  let footerLinksHtml = ""
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
      `
    } else {
      footerLinksHtml = `
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          This is an automated transmission from <a href="https://fi.amanillah.com" style="color: #64748b; text-decoration: underline;">fi.amanillah.com</a>.
          If you did not initiate this request, you can safely disregard it.
        </p>
      `
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
  <title>${title}</title>
  ${headExtraHtml}
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
    ${previewText}
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
                ${title}
              </h1>
              ${
                subtitle
                  ? `<p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">${subtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="email-content" style="padding: 14px 32px 28px 32px; color: #334155; font-size: 14px; line-height: 1.65; border-radius: 0;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Unified Clean Footer -->
          <tr>
            <td class="email-footer" style="padding: 22px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                      Fi Amanillah <span style="font-weight: 400; color: #64748b;">&mdash; Full Stack Developer</span>
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
  `.trim()

  return {
    html,
    listUnsubscribeHeader: unsubscribeUrl ? `<${unsubscribeUrl}>` : "",
  }
}
