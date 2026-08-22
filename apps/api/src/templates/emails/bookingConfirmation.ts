// src/templates/emails/bookingConfirmation.ts
import { renderEmailLayout } from "./baseLayout"
import {
  generateCalendarDeeplinks,
  generateEventReservationJsonLd,
} from "../../utils/icsGenerator"

export interface BookingConfirmationOptions {
  bookingId?: string
  guestName: string
  guestEmail: string
  meetingType: string
  startTime: Date | string
  endTime: Date | string
  durationMinutes: number
  timezone: string
  googleMeetLink?: string | null
  cancellationToken: string
  guestNotes?: string | null
  webUrl?: string
}

/**
 * Returns raw Liquid template HTML body for Plunk Template synchronization.
 */
export function getBookingConfirmationLiquidBody(): string {
  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>{{ guestName | default: 'there' }}</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      Your 1-on-1 session with <strong>Fi Amanillah</strong> has been confirmed. A calendar invitation is attached to this email, and you can also add it to your calendar with one click below.
    </p>

    <!-- Meeting Session Details Card -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">
        [SESSION DETAILS]
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #334155; line-height: 1.6;">
        <tr>
          <td width="35%" style="padding: 4px 0; font-weight: 600; color: #64748b;">Topic:</td>
          <td width="65%" style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{ meetingType }}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Date & Time:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">{{ formattedStartTime }} ({{ timezone }})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">{{ durationMinutes }} Minutes</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Timezone:</td>
          <td style="padding: 4px 0; color: #0f172a; font-family: ui-monospace, monospace;">{{ timezone }}</td>
        </tr>
      </table>

      {% if googleMeetLink %}
      <!-- Video Conference Box -->
      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #0f172a;">
          Google Meet Video Link:
        </p>
        <a href="{{ googleMeetLink }}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 0;">
          Join Google Meet Room &rarr;
        </a>
      </div>
      {% endif %}
    </div>

    <!-- 1-Click Add to Calendar Box -->
    <div style="margin: 20px 0; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 18px 20px;">
      <p style="margin: 0 0 10px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">
        [1-CLICK CALENDAR SYNC]
      </p>
      <p style="margin: 0 0 14px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
        Add this session directly to your preferred calendar:
      </p>
      
      <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px;">
        <tr>
          <td style="padding-right: 8px; padding-bottom: 8px;">
            <a href="{{ googleCalUrl }}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 0;">
              + Google Calendar
            </a>
          </td>
          <td style="padding-right: 8px; padding-bottom: 8px;">
            <a href="{{ outlookCalUrl }}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 0;">
              + Outlook / 365
            </a>
          </td>
          <td style="padding-bottom: 8px;">
            <a href="{{ icsDownloadUrl }}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 0;">
              Download .ICS
            </a>
          </td>
        </tr>
      </table>
    </div>

    {% if guestNotes %}
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        YOUR AGENDA NOTES
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">{{ guestNotes }}</p>
    </div>
    {% endif %}

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
      Need to reschedule or cancel? You can manage this meeting anytime at:
      <br>
      <a href="{{ cancelUrl }}" style="color: #ef4444; text-decoration: underline;">Cancel / Manage Booking</a>
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Looking forward to our session,<br>
        <strong style="color: #0f172a;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html } = renderEmailLayout({
    badgeLabel: "Meeting Confirmed",
    title: "Your Meeting is Scheduled",
    subtitle: "Consultation confirmed with Fi Amanillah",
    contentHtml,
    previewText:
      "Your consultation session with Fi Amanillah is confirmed. Google Meet link and calendar invite inside.",
    showUnsubscribe: false,
  })

  return html
}

/**
 * Renders the Booking Confirmation email with concrete values.
 */
export function renderBookingConfirmationEmail(
  options: BookingConfirmationOptions
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
  const cancelUrl = `${webUrl}/#book-call?cancelToken=${options.cancellationToken}`
  const icsDownloadUrl = `${webUrl}/api/v1/booking/ics?token=${options.cancellationToken}`
  const emailSubject = `[Confirmed] ${options.meetingType} - Fi Amanillah (${formattedStartTime})`

  const calendarLinks = generateCalendarDeeplinks({
    title: `${options.meetingType} with Fi Amanillah`,
    startTime: options.startTime,
    endTime: options.endTime,
    description: `1-on-1 Consultation Session.\n\nGoogle Meet: ${options.googleMeetLink || "Online Room"}\nNotes: ${options.guestNotes || "None"}`,
    location: options.googleMeetLink || "Google Meet Video Call",
  })

  const schemaJsonLd = generateEventReservationJsonLd({
    bookingId: options.bookingId || options.cancellationToken,
    meetingType: options.meetingType,
    startTime: options.startTime,
    endTime: options.endTime,
    guestName: options.guestName,
    guestEmail: options.guestEmail,
    googleMeetLink: options.googleMeetLink,
    organizerName: "Fi Amanillah",
    organizerEmail: "fi@amanillah.com",
  })

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
      Hi <strong>${options.guestName || "there"}</strong>,
    </p>
    
    <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
      Your 1-on-1 session with <strong>Fi Amanillah</strong> is confirmed! A calendar invitation is attached to this email, and you can also add it to your calendar with one click below.
    </p>

    <!-- Meeting Session Details Card -->
    <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px;">
      <p style="margin: 0 0 12px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">
        [SESSION DETAILS]
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #334155; line-height: 1.6;">
        <tr>
          <td width="35%" style="padding: 4px 0; font-weight: 600; color: #64748b;">Topic:</td>
          <td width="65%" style="padding: 4px 0; font-weight: 600; color: #0f172a;">${options.meetingType}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Date & Time:</td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${formattedStartTime} (${options.timezone || "UTC"})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Duration:</td>
          <td style="padding: 4px 0; color: #0f172a;">${options.durationMinutes} Minutes</td>
        </tr>
      </table>

      ${
        options.googleMeetLink
          ? `
      <!-- Video Conference Box -->
      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #0f172a;">
          Google Meet Video Room:
        </p>
        <a href="${options.googleMeetLink}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 9px 18px; border-radius: 0;">
          Join Google Meet &rarr;
        </a>
      </div>
      `
          : ""
      }
    </div>

    <!-- 1-Click Add to Calendar Box -->
    <div style="margin: 20px 0; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 18px 20px;">
      <p style="margin: 0 0 10px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">
        [1-CLICK CALENDAR SYNC]
      </p>
      <p style="margin: 0 0 14px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
        Add this session directly to your preferred calendar:
      </p>
      
      <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px;">
        <tr>
          <td style="padding-right: 8px; padding-bottom: 8px;">
            <a href="${calendarLinks.googleCalendarUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 0;">
              + Google Calendar
            </a>
          </td>
          <td style="padding-right: 8px; padding-bottom: 8px;">
            <a href="${calendarLinks.outlookLiveUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 0;">
              + Outlook / 365
            </a>
          </td>
          <td style="padding-bottom: 8px;">
            <a href="${icsDownloadUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 0;">
              Download .ICS
            </a>
          </td>
        </tr>
      </table>
    </div>

    ${
      options.guestNotes
        ? `
    <div style="margin: 16px 0; background-color: #ffffff; border: 1px solid #e2e8f0; padding: 14px 16px;">
      <p style="margin: 0 0 4px 0; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
        YOUR AGENDA NOTES
      </p>
      <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap;">${options.guestNotes}</p>
    </div>
    `
        : ""
    }

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">
      Need to cancel? You can cancel your booking anytime here:
      <br>
      <a href="${cancelUrl}" style="color: #ef4444; text-decoration: underline;">Cancel this booking</a>
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Looking forward to our session,<br>
        <strong style="color: #0f172a;">Fi Amanillah</strong>
      </p>
    </div>
  `.trim()

  const { html, listUnsubscribeHeader } = renderEmailLayout({
    badgeLabel: "Meeting Confirmed",
    title: "Meeting Confirmed",
    subtitle: `${options.meetingType} with Fi Amanillah`,
    contentHtml,
    previewText: `Your consultation on ${formattedStartTime} is confirmed. Google Meet link and calendar invite inside.`,
    showUnsubscribe: false,
    headExtraHtml: schemaJsonLd,
  })

  return {
    subject: emailSubject,
    html,
    listUnsubscribeHeader,
  }
}

