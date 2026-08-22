// src/templates/emails/otpVerification.ts
import { renderEmailLayout } from "./baseLayout"

export type OtpEmailPurpose =
  | "REGISTER_EMAIL_VERIFY"
  | "PASSWORD_RESET"
  | "LOGIN_2FA"

export interface OtpEmailOptions {
  email: string
  code: string
  name?: string
  purpose?: OtpEmailPurpose
  expiresInMinutes?: number
}

/**
 * Returns the raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getOtpVerificationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0; color: #334155; line-height: 1.65;">
      {% if purpose == 'PASSWORD_RESET' %}
        We received a request to reset your password. Use the single-use verification code below to establish a new password for your account:
      {% elsif purpose == 'LOGIN_2FA' %}
        Enter the security verification code below to authorize your account sign-in:
      {% else %}
        Thank you for joining my developer portal. Enter the 6-digit verification code below to verify your email address and activate your account:
      {% endif %}
    </p>

    <!-- OTP Code Display Card -->
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 18px 32px; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.14em; text-transform: uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
          SECURITY PASSCODE
        </p>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.28em; color: #0f172a;">
          {{ code }}
        </div>
      </div>
    </div>

    <!-- Security Information Box -->
    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 18px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        NOTICE &amp; EXPIRATION
      </p>
      <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
        This code expires in <strong style="color: #0f172a;">{{ expiresInMinutes | default: 10 }} minutes</strong>. For your security, never share this code with anyone.
      </p>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
      If you did not make this request, you can safely disregard this email. Your account credentials remain intact.
    </p>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Security",
    title: "Your Verification Code",
    subtitle: "Single-use verification passcode for your account",
    contentHtml,
    previewText:
      "Your 6-digit verification code is {{ code }}. Valid for 10 minutes.",
    showUnsubscribe: false,
  })

  return html
}

/**
 * Renders the OTP Email with concrete runtime values.
 */
export function renderOtpEmail(options: OtpEmailOptions): {
  subject: string
  html: string
  listUnsubscribeHeader: string
} {
  const {
    email,
    code,
    name,
    purpose = "REGISTER_EMAIL_VERIFY",
    expiresInMinutes = 10,
  } = options

  const displayName =
    name && name.trim().length > 0
      ? name.trim()
      : email.split("@")[0] || "there"

  let badgeLabel = "Verification"
  let title = "Verify Your Email"
  let subtitle = "Activate your account on fi.amanillah.com"
  let subject = `[${code}] Your Email Verification Code — Fi Amanillah`
  let leadText =
    "Thank you for joining my developer portal. Enter the 6-digit verification code below to verify your email address and activate your account:"

  if (purpose === "PASSWORD_RESET") {
    badgeLabel = "Recovery"
    title = "Reset Your Password"
    subtitle = "Single-use recovery passcode for your account"
    subject = `[${code}] Password Reset Code — Fi Amanillah`
    leadText =
      "We received a request to reset your password. Use the single-use verification code below to establish a new password for your account:"
  } else if (purpose === "LOGIN_2FA") {
    badgeLabel = "Authentication"
    title = "Two-Factor Security Code"
    subtitle = "Verify your sign-in session"
    subject = `[${code}] Sign-in Security Code — Fi Amanillah`
    leadText =
      "Enter the security verification code below to authorize your account sign-in:"
  }

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>${displayName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0; color: #334155; line-height: 1.65;">
      ${leadText}
    </p>

    <!-- OTP Code Display Card -->
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 18px 32px; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.14em; text-transform: uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
          SECURITY PASSCODE
        </p>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.28em; color: #0f172a;">
          ${code}
        </div>
      </div>
    </div>

    <!-- Security Information Box -->
    <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 18px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
        NOTICE &amp; EXPIRATION
      </p>
      <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
        This code expires in <strong style="color: #0f172a;">${expiresInMinutes} minutes</strong>. For your security, never share this code with anyone.
      </p>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
      If you did not make this request, you can safely disregard this email. Your account credentials remain intact.
    </p>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel,
    title,
    subtitle,
    contentHtml,
    previewText: `Your verification code is ${code}. Valid for ${expiresInMinutes} minutes.`,
    showUnsubscribe: false,
  })

  return { subject, html, listUnsubscribeHeader }
}
