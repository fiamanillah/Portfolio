// src/templates/emails/bookingCancellation.ts
import { renderEmailLayout } from "./baseLayout"

export interface BookingCancellationOptions {
  guestName: string
  guestEmail: string
  meetingType: string
  startTime: Date | string
  endTime: Date | string
  durationMinutes: number
  timezone: string
  reason?: string | null
  cancelledBy?: "guest" | "host"
  webUrl?: string
  dashboardUrl?: string
  bookingId?: string
}

/**
 * Returns raw Liquid template HTML body for Attendee Cancellation Plunk Template.
 */
export function getBookingCancellationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>{{ guestName | default: 'there' }}</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      The following scheduled meeting session with <strong>Fi Amanillah</strong> has been cancelled.
    </p>

    <!-- Meeting Session Details Card -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #ef4444; text-transform: uppercase; letter-spacing: 0.05em;">
        [CANCELLED SESSION]
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #334155; line-height: 1.6; border-collapse: collapse;">
        <tr>
          <td width="35%" style="padding: 4px 0; font-weight: 600; color: #64748b;">Topic:</td>
          <td width="65%" style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{ meetingType }}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Originally Scheduled:</td>
          <td style="padding: 4px 0; color: #0f172a;">{{ formattedStartTime }}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">{{ durationMinutes }} Minutes</td>
        </tr>
      </table>
    </div>

    {% if reason %}
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        REASON PROVIDED
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">{{ reason }}</p>
    </div>
    {% endif %}

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #334155; line-height: 1.6;">
      If you would like to reschedule for another time, you are welcome to pick an open slot anytime on the booking calendar:
      <br>
      <a href="{{ rescheduleUrl | default: 'https://fi.amanillah.com/#book-call' }}" style="display: inline-block; margin-top: 10px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 0; border: 1px solid #0f172a;">
        Schedule New Session &rarr;
      </a>
    </p>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Meeting Cancelled",
    title: "Meeting Cancelled",
    subtitle: "Your scheduled session has been cancelled",
    contentHtml,
    previewText: "Your scheduled consultation session with Fi Amanillah has been cancelled.",
    showUnsubscribe: false,
  })

  return html
}

/**
 * Returns raw Liquid template HTML body for Host Cancellation Alert Plunk Template.
 */
export function getHostCancellationNotificationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>Fi</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      A scheduled consultation meeting has been cancelled. The calendar event has been removed and the time slot is freed for new bookings.
    </p>

    <!-- Details Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #334155; line-height: 1.6; border-collapse: collapse;">
        <tr>
          <td width="30%" style="padding: 4px 0; font-weight: 600; color: #64748b;">Attendee:</td>
          <td width="70%" style="padding: 4px 0; font-weight: 600; color: #0f172a;">
            {{ guestName }} &lt;<a href="mailto:{{ guestEmail }}" style="color: #0284c7;">{{ guestEmail }}</a>&gt;
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Topic:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">{{ meetingType }}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Cancelled Time:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">{{ formattedStartTime }}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">{{ durationMinutes }} mins</td>
        </tr>
      </table>
    </div>

    {% if reason %}
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        REASON GIVEN
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">{{ reason }}</p>
    </div>
    {% endif %}

    <div style="margin-top: 24px;">
      <a href="{{ bookingsPageUrl | default: 'https://admin.fi.amanillah.com/bookings' }}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a;">
        Open Admin Bookings Dashboard &rarr;
      </a>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Booking Cancelled",
    title: "Meeting Cancelled",
    subtitle: "A scheduled session has been cancelled",
    contentHtml,
    previewText: "Meeting with {{ guestName }} has been cancelled.",
    showUnsubscribe: false,
  })

  return html
}

/**
 * Renders the Booking Cancellation email for the guest.
 */
export function renderBookingCancellationEmail(
  options: BookingCancellationOptions
): {
  subject: string
  html: string
  listUnsubscribeHeader: string
} {
  const startDate = new Date(options.startTime)
  const formattedStartTime = startDate.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: options.timezone || "UTC",
  })

  const webUrl = options.webUrl || "https://fi.amanillah.com"
  const rescheduleUrl = `${webUrl}/#book-call`
  const emailSubject = `[Cancelled] ${options.meetingType} - Fi Amanillah (${formattedStartTime})`

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>${options.guestName || "there"}</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      This email confirms that your scheduled meeting session with <strong>Fi Amanillah</strong> has been cancelled.
    </p>

    <!-- Meeting Session Details Card -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #ef4444; text-transform: uppercase; letter-spacing: 0.05em;">
        [CANCELLED SESSION]
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #334155; line-height: 1.6; border-collapse: collapse;">
        <tr>
          <td width="35%" style="padding: 4px 0; font-weight: 600; color: #64748b;">Topic:</td>
          <td width="65%" style="padding: 4px 0; font-weight: 600; color: #0f172a;">${options.meetingType}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Originally Scheduled:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${formattedStartTime} (${options.timezone || "UTC"})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">${options.durationMinutes} Minutes</td>
        </tr>
      </table>
    </div>

    ${
      options.reason
        ? `
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        REASON
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${options.reason}</p>
    </div>
    `
        : ""
    }

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #334155; line-height: 1.6;">
      Need to reschedule? You can pick a new time slot anytime on the booking calendar:
      <br>
      <a href="${rescheduleUrl}" style="display: inline-block; margin-top: 10px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 9px 18px; border-radius: 0; border: 1px solid #0f172a;">
        Schedule New Session &rarr;
      </a>
    </p>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "Meeting Cancelled",
    title: "Meeting Cancelled",
    subtitle: "Consultation session has been cancelled",
    contentHtml,
    previewText: `Meeting with Fi Amanillah (${options.meetingType}) has been cancelled.`,
    showUnsubscribe: false,
  })

  return {
    subject: emailSubject,
    html,
    listUnsubscribeHeader,
  }
}

/**
 * Renders the Booking Cancellation notification email for the host/admin.
 */
export function renderHostCancellationNotificationEmail(
  options: BookingCancellationOptions
): {
  subject: string
  html: string
  listUnsubscribeHeader: string
} {
  const startDate = new Date(options.startTime)
  const formattedStartTime = startDate.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: options.timezone || "UTC",
  })

  const dashboardUrl =
    options.dashboardUrl || "https://admin.fi.amanillah.com"
  const bookingsPageUrl = `${dashboardUrl}/bookings`
  const emailSubject = `[Cancelled Booking] ${options.guestName} cancelled "${options.meetingType}" (${formattedStartTime})`

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>Fi</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      A scheduled consultation meeting has been cancelled ${options.cancelledBy === "guest" ? "by the attendee" : "by administrator"}. The Google Calendar event has been removed and the time slot is freed for new bookings.
    </p>

    <!-- Details Box -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #334155; line-height: 1.6; border-collapse: collapse;">
        <tr>
          <td width="30%" style="padding: 4px 0; font-weight: 600; color: #64748b;">Attendee:</td>
          <td width="70%" style="padding: 4px 0; font-weight: 600; color: #0f172a;">
            ${options.guestName} &lt;<a href="mailto:${options.guestEmail}" style="color: #0284c7;">${options.guestEmail}</a>&gt;
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Topic:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${options.meetingType}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Cancelled Time:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${formattedStartTime} (${options.timezone || "UTC"})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">${options.durationMinutes} mins</td>
        </tr>
      </table>
    </div>

    ${
      options.reason
        ? `
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        REASON GIVEN
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${options.reason}</p>
    </div>
    `
        : ""
    }

    <div style="margin-top: 24px;">
      <a href="${bookingsPageUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a;">
        Open Admin Bookings Dashboard &rarr;
      </a>
    </div>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "Booking Cancelled",
    title: "Meeting Cancelled",
    subtitle: `${options.guestName} cancelled their session`,
    contentHtml,
    previewText: `${options.guestName} cancelled "${options.meetingType}" for ${formattedStartTime}`,
    showUnsubscribe: false,
  })

  return {
    subject: emailSubject,
    html,
    listUnsubscribeHeader,
  }
}
