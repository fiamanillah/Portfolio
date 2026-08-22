// src/utils/icsGenerator.ts
/**
 * RFC 5545 and RFC 6047 (iMIP) compliant iCalendar generator.
 * Produces valid .ics payloads that trigger native mail client RSVP banners
 * (Gmail "Going? Yes/No/Maybe", Outlook "Accept/Decline", Apple Mail "Event Invitation").
 */

export interface IcsEventOptions {
  uid: string
  sequence?: number
  method?: "REQUEST" | "CANCEL"
  status?: "CONFIRMED" | "CANCELLED"
  startTime: Date | string
  endTime: Date | string
  summary: string
  description?: string | null
  location?: string | null
  organizerName?: string
  organizerEmail?: string
  attendeeName?: string
  attendeeEmail: string
  created?: Date
}

export interface CalendarDeeplinkOptions {
  title: string
  startTime: Date | string
  endTime: Date | string
  description?: string | null
  location?: string | null
}

export interface CalendarDeeplinks {
  googleCalendarUrl: string
  outlookLiveUrl: string
  outlookOfficeUrl: string
  yahooCalendarUrl: string
}

/**
 * Format a Date to UTC string in iCalendar format: YYYYMMDDTHHMMSSZ
 */
export function formatIcsUtcDate(dateInput: Date | string): string {
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided to formatIcsUtcDate: ${dateInput}`)
  }
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

/**
 * Escape text for iCalendar properties per RFC 5545 section 3.3.11
 */
export function escapeIcsText(text?: string | null): string {
  if (!text) return ""
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

/**
 * Fold long lines to comply with RFC 5545 (max 75 octets per line)
 */
export function foldIcsLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let remaining = line
  while (remaining.length > 75) {
    parts.push(remaining.substring(0, 75))
    remaining = " " + remaining.substring(75)
  }
  parts.push(remaining)
  return parts.join("\r\n")
}

/**
 * Generate RFC 5545 / RFC 6047 compliant VCALENDAR string
 */
export function generateIcsContent(options: IcsEventOptions): string {
  const method = options.method || "REQUEST"
  const status = options.status || (method === "CANCEL" ? "CANCELLED" : "CONFIRMED")
  const sequence = options.sequence ?? (method === "CANCEL" ? 1 : 0)
  const dtStamp = formatIcsUtcDate(options.created || new Date())
  const dtStart = formatIcsUtcDate(options.startTime)
  const dtEnd = formatIcsUtcDate(options.endTime)

  const organizerName = options.organizerName || "Fi Amanillah"
  const organizerEmail = options.organizerEmail || "fi@amanillah.com"
  const attendeeName = options.attendeeName || options.attendeeEmail.split("@")[0]
  const attendeeEmail = options.attendeeEmail.trim()

  const summary = escapeIcsText(options.summary)
  const description = escapeIcsText(
    options.description ||
      `Meeting with ${organizerName}.${options.location ? `\n\nGoogle Meet: ${options.location}` : ""}`
  )
  const location = escapeIcsText(options.location || "Google Meet Video Call")

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Fi Amanillah//Portfolio Booking System//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${options.uid.includes("@") ? options.uid : `${options.uid}@fi.amanillah.com`}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:${status}`,
    `SEQUENCE:${sequence}`,
    `TRANSP:${method === "CANCEL" ? "TRANSPARENT" : "OPAQUE"}`,
    `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
  ]

  if (method === "REQUEST") {
    lines.push(
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendeeName}:mailto:${attendeeEmail}`
    )
  } else {
    lines.push(
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=DECLINED;CN=${attendeeName}:mailto:${attendeeEmail}`
    )
  }

  if (options.location && options.location.startsWith("http")) {
    lines.push(`URL;VALUE=URI:${options.location}`)
    lines.push(`X-GOOGLE-CONFERENCE:${options.location}`)
  }

  lines.push("END:VEVENT")
  lines.push("END:VCALENDAR")

  return lines.map(foldIcsLine).join("\r\n") + "\r\n"
}

/**
 * Generate 1-Click Calendar Deep Links for Webmail / Third-party clients
 */
export function generateCalendarDeeplinks(
  options: CalendarDeeplinkOptions
): CalendarDeeplinks {
  const startUtc = formatIcsUtcDate(options.startTime)
  const endUtc = formatIcsUtcDate(options.endTime)
  const startIso = new Date(options.startTime).toISOString()
  const endIso = new Date(options.endTime).toISOString()

  const title = encodeURIComponent(options.title)
  const description = encodeURIComponent(options.description || "")
  const location = encodeURIComponent(options.location || "Google Meet")

  // Google Calendar Link
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${description}&location=${location}`

  // Outlook Live (Consumer) Link
  const outlookLiveUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${startIso}&enddt=${endIso}&body=${description}&location=${location}`

  // Outlook 365 / Corporate Link
  const outlookOfficeUrl = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${startIso}&enddt=${endIso}&body=${description}&location=${location}`

  // Yahoo Calendar Link
  const yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${startUtc}&et=${endUtc}&desc=${description}&in_loc=${location}`

  return {
    googleCalendarUrl,
    outlookLiveUrl,
    outlookOfficeUrl,
    yahooCalendarUrl,
  }
}

/**
 * Generate Schema.org EventReservation JSON-LD snippet for Gmail Actions
 */
export function generateEventReservationJsonLd(options: {
  bookingId: string
  meetingType: string
  startTime: Date | string
  endTime: Date | string
  guestName: string
  guestEmail: string
  googleMeetLink?: string | null
  organizerName?: string
  organizerEmail?: string
}): string {
  const schema = {
    "@context": "http://schema.org",
    "@type": "EventReservation",
    reservationNumber: options.bookingId,
    reservationStatus: "http://schema.org/Confirmed",
    underName: {
      "@type": "Person",
      name: options.guestName,
      email: options.guestEmail,
    },
    reservationFor: {
      "@type": "BusinessEvent",
      name: `${options.meetingType} with ${options.organizerName || "Fi Amanillah"}`,
      startDate: new Date(options.startTime).toISOString(),
      endDate: new Date(options.endTime).toISOString(),
      location: options.googleMeetLink
        ? {
            "@type": "VirtualLocation",
            name: "Google Meet",
            url: options.googleMeetLink,
          }
        : {
            "@type": "VirtualLocation",
            name: "Online Video Call",
          },
      organizer: {
        "@type": "Person",
        name: options.organizerName || "Fi Amanillah",
        email: options.organizerEmail || "fi@amanillah.com",
      },
    },
  }

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
}
