// src/templates/emails/bookingNotification.ts
import { renderEmailLayout } from "./baseLayout"

export interface BookingNotificationOptions {
  guestName: string
  guestEmail: string
  meetingType: string
  startTime: Date | string
  endTime: Date | string
  durationMinutes: number
  timezone: string
  googleMeetLink?: string | null
  guestNotes?: string | null
  bookingId: string
  dashboardUrl?: string
}

/**
 * Returns raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getBookingNotificationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>Fi</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      A new consultation meeting has been scheduled via your portfolio booking engine:
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
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Date & Time:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">{{ formattedStartTime }} ({{ timezone | default: 'UTC' }})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">{{ durationMinutes }} mins</td>
        </tr>
      </table>

      {% if googleMeetLink %}
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
        <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Google Meet Room: </span>
        <a href="{{ googleMeetLink }}" target="_blank" style="font-size: 12px; color: #0284c7; text-decoration: underline; font-family: ui-monospace, monospace;">
          {{ googleMeetLink }}
        </a>
      </div>
      {% endif %}
    </div>

    {% if guestNotes %}
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        AGENDA / NOTES FROM GUEST
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">{{ guestNotes }}</p>
    </div>
    {% endif %}

    <div style="margin-top: 24px;">
      <a href="{{ bookingsPageUrl | default: 'https://admin.fi.amanillah.com/bookings' }}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a;">
        Open Admin Bookings Dashboard &rarr;
      </a>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "New Booking",
    title: "New Meeting Scheduled",
    subtitle: "{{ guestName }} booked a consultation",
    contentHtml,
    previewText: "New meeting booked by {{ guestName }}",
    showUnsubscribe: false,
  })

  return html
}

export function renderBookingNotificationEmail(
  options: BookingNotificationOptions
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
  })

  const dashboardUrl =
    options.dashboardUrl || "http://localhost:3001"
  const bookingsPageUrl = `${dashboardUrl}/bookings`
  const emailSubject = `[New Booking] ${options.guestName} booked "${options.meetingType}" for ${formattedStartTime}`

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>Fi</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      A new consultation meeting has been scheduled via your portfolio booking engine:
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
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Date & Time:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${formattedStartTime} (${options.timezone || "UTC"})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">${options.durationMinutes} mins</td>
        </tr>
      </table>

      ${
        options.googleMeetLink
          ? `
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
        <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Google Meet Room: </span>
        <a href="${options.googleMeetLink}" target="_blank" style="font-size: 12px; color: #0284c7; text-decoration: underline; font-family: ui-monospace, monospace;">
          ${options.googleMeetLink}
        </a>
      </div>
      `
          : ""
      }
    </div>

    ${
      options.guestNotes
        ? `
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        AGENDA / NOTES FROM GUEST
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${options.guestNotes}</p>
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
    badgeLabel: "New Booking",
    title: "New Meeting Scheduled",
    subtitle: `${options.guestName} booked a consultation`,
    contentHtml,
    previewText: `New meeting booked by ${options.guestName} for ${formattedStartTime}`,
    showUnsubscribe: false,
  })

  return {
    subject: emailSubject,
    html,
    listUnsubscribeHeader,
  }
}
