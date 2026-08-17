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
 * Clean, Minimalist & Flat White-Themed Email Layout matching Fi Amanillah's Portfolio.
 * 0 rounded corners, uniform 1px borders, high-contrast typography, and resilient HTML tables.
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
        <p style="margin: 14px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          You received this email because you subscribed or submitted a message on <a href="https://fi.amanillah.com" style="color: #0f172a; text-decoration: underline;">fi.amanillah.com</a>.
        </p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">
          <a href="${unsubscribeUrl}" style="color: #0f172a; text-decoration: underline;">Unsubscribe</a>
          ${manageUrl ? `&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${manageUrl}" style="color: #64748b; text-decoration: underline;">Preferences</a>` : ""}
        </p>
      `
    } else {
      footerLinksHtml = `
        <p style="margin: 14px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          This is a transactional transmission from <a href="https://fi.amanillah.com" style="color: #0f172a; text-decoration: underline;">fi.amanillah.com</a>.
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
        padding: 20px 16px !important;
      }
      .email-content {
        padding: 12px 20px 24px 20px !important;
      }
      .email-header {
        padding: 20px 20px 16px 20px !important;
      }
      .email-title-section {
        padding: 20px 20px 6px 20px !important;
      }
      .email-footer {
        padding: 18px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ${fontSans}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #334155;">
  <!-- Preview text snippet for inbox list -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f8fafc;">
    ${previewText}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container Card -->
        <table class="email-container" role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0;">
          
          <!-- Header Bar with Brand and Monospace Badge -->
          <tr>
            <td class="email-header" style="padding: 24px 32px 18px 32px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <a href="https://fi.amanillah.com" style="text-decoration: none; display: inline-flex; align-items: center;">
                            <span style="font-family: ${fontSans}; font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                              Fi Amanillah
                            </span>
                          </a>
                        </td>
                        ${
                          badgeLabel
                            ? `<td style="padding-left: 10px; vertical-align: middle;">
                                <span style="font-family: ${fontMono}; font-size: 11px; font-weight: 600; color: #475569; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 0; display: inline-block; text-transform: uppercase; letter-spacing: 0.04em;">
                                  ${badgeLabel}
                                </span>
                              </td>`
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="https://fi.amanillah.com" style="font-family: ${fontMono}; font-size: 12px; color: #64748b; text-decoration: none; font-weight: 500;">
                      fi.amanillah.com
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td class="email-title-section" style="padding: 24px 32px 6px 32px;">
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
            <td class="email-content" style="padding: 14px 32px 28px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Clean Minimal Footer -->
          <tr>
            <td class="email-footer" style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                      Fi Amanillah
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b;">
                      Full-Stack &amp; DevOps Engineer
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      <a href="https://fi.amanillah.com" style="color: #64748b; text-decoration: underline; margin-right: 12px;">Home</a>
                      <a href="https://fi.amanillah.com/blog" style="color: #64748b; text-decoration: underline; margin-right: 12px;">Blog</a>
                      <a href="https://github.com/fiamanillah" style="color: #64748b; text-decoration: underline; margin-right: 12px;">GitHub</a>
                      <a href="https://www.linkedin.com/in/fi-amanillah/" style="color: #64748b; text-decoration: underline;">LinkedIn</a>
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
