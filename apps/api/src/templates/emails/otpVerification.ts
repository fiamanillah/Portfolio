// src/templates/emails/otpVerification.ts
import { renderEmailLayout } from "./baseLayout";

export type OtpEmailPurpose = "REGISTER_EMAIL_VERIFY" | "PASSWORD_RESET" | "LOGIN_2FA";

export interface OtpEmailOptions {
  email: string;
  code: string;
  name?: string;
  purpose?: OtpEmailPurpose;
  expiresInMinutes?: number;
}

/**
 * Returns the raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getOtpVerificationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #f1f5f9;">
      Hi <strong style="color: #ffffff;">{{ name | default: firstName | default: 'there' }}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0; color: #94a3b8; line-height: 1.7;">
      {% if purpose == 'PASSWORD_RESET' %}
        We received a request to reset your password. Use the single-use verification code below to establish a new password for your account:
      {% elsif purpose == 'LOGIN_2FA' %}
        Enter the security verification code below to authorize your account sign-in:
      {% else %}
        Thank you for joining my developer portal! Enter the 6-digit verification code below to verify your email address and activate your account:
      {% endif %}
    </p>

    <!-- OTP Code Display Card -->
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background: #0c1427; border: 1px solid #06b6d4; border-radius: 8px; padding: 18px 32px; box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);">
        <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 0.15em; text-transform: uppercase; font-family: ui-monospace, Menlo, Consolas, monospace;">
          // SECURITY_PASSCODE
        </p>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.3em; color: #ffffff; text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);">
          {{ code }}
        </div>
      </div>
    </div>

    <!-- Security Information Box -->
    <div style="margin: 24px 0; background-color: #131c31; border: 1px solid #1e293b; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 14px 18px;">
      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.06em;">
        Notice & Expiration
      </p>
      <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
        This code expires in <strong style="color: #ffffff;">{{ expiresInMinutes | default: 10 }} minutes</strong>. For your security, never share this code with anyone.
      </p>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
      If you did not make this request, you can safely disregard this email. Your account credentials remain intact.
    </p>

    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        Best regards,<br>
        <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim();

  const { html } = renderEmailLayout({
    badgeLabel: "Security Code",
    title: "Your Verification Code",
    subtitle: "Single-use verification passcode for your account",
    contentHtml,
    previewText: "Your 6-digit verification code is {{ code }}. Valid for 10 minutes.",
    showUnsubscribe: false,
  });

  return html;
}

/**
 * Renders the OTP Email with concrete runtime values.
 */
export function renderOtpEmail(options: OtpEmailOptions): {
  subject: string;
  html: string;
  listUnsubscribeHeader: string;
} {
  const {
    email,
    code,
    name,
    purpose = "REGISTER_EMAIL_VERIFY",
    expiresInMinutes = 10,
  } = options;

  const displayName = name && name.trim().length > 0 ? name.trim() : email.split("@")[0] || "there";

  let badgeLabel = "Verification";
  let title = "Verify Your Email";
  let subtitle = "Activate your account on fi.amanillah.dev";
  let subject = `[${code}] Your Email Verification Code — Fi Amanillah`;
  let leadText = "Thank you for joining my developer portal! Enter the 6-digit verification code below to verify your email address and activate your account:";

  if (purpose === "PASSWORD_RESET") {
    badgeLabel = "Password Recovery";
    title = "Reset Your Password";
    subtitle = "Single-use recovery passcode for your account";
    subject = `[${code}] Password Reset Code — Fi Amanillah`;
    leadText = "We received a request to reset your password. Use the single-use verification code below to establish a new password for your account:";
  } else if (purpose === "LOGIN_2FA") {
    badgeLabel = "Authentication";
    title = "Two-Factor Security Code";
    subtitle = "Verify your sign-in session";
    subject = `[${code}] Sign-in Security Code — Fi Amanillah`;
    leadText = "Enter the security verification code below to authorize your account sign-in:";
  }

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #f1f5f9;">
      Hi <strong style="color: #ffffff;">${displayName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0; color: #94a3b8; line-height: 1.7;">
      ${leadText}
    </p>

    <!-- OTP Code Display Card -->
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background: #0c1427; border: 1px solid #06b6d4; border-radius: 8px; padding: 18px 32px; box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);">
        <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 0.15em; text-transform: uppercase; font-family: ui-monospace, Menlo, Consolas, monospace;">
          // SECURITY_PASSCODE
        </p>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.3em; color: #ffffff; text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);">
          ${code}
        </div>
      </div>
    </div>

    <!-- Security Information Box -->
    <div style="margin: 24px 0; background-color: #131c31; border: 1px solid #1e293b; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 14px 18px;">
      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.06em;">
        Notice & Expiration
      </p>
      <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
        This code expires in <strong style="color: #ffffff;">${expiresInMinutes} minutes</strong>. For your security, never share this code with anyone.
      </p>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
      If you did not make this request, you can safely disregard this email. Your account credentials remain intact.
    </p>

    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #1e293b;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        Best regards,<br>
        <strong style="color: #f8fafc;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim();

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel,
    title,
    subtitle,
    contentHtml,
    previewText: `Your verification code is ${code}. Valid for ${expiresInMinutes} minutes.`,
    showUnsubscribe: false,
  });

  return { subject, html, listUnsubscribeHeader };
}
