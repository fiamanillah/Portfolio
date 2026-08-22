// src/tests/icsGenerator.test.ts
import { describe, it, expect } from "bun:test"
import {
  generateIcsContent,
  generateCalendarDeeplinks,
  generateEventReservationJsonLd,
  formatIcsUtcDate,
  escapeIcsText,
  foldIcsLine,
} from "../utils/icsGenerator"
import { renderBookingConfirmationEmail } from "../templates/emails/bookingConfirmation"

describe("iCalendar Generator (icsGenerator.ts)", () => {
  const sampleStart = new Date("2026-08-25T14:00:00.000Z")
  const sampleEnd = new Date("2026-08-25T14:30:00.000Z")

  it("should format UTC dates correctly per RFC 5545", () => {
    const formatted = formatIcsUtcDate(sampleStart)
    expect(formatted).toBe("20260825T140000Z")
  })

  it("should escape special characters in text fields", () => {
    const raw = "Line 1, with comma; and semicolon\nLine 2 with \\ backslash"
    const escaped = escapeIcsText(raw)
    expect(escaped).toBe("Line 1\\, with comma\\; and semicolon\\nLine 2 with \\\\ backslash")
  })

  it("should fold long lines over 75 octets", () => {
    const longLine = "DESCRIPTION:" + "A".repeat(100)
    const folded = foldIcsLine(longLine)
    const lines = folded.split("\r\n")
    expect(lines.length).toBeGreaterThan(1)
    expect(lines[0].length).toBeLessThanOrEqual(75)
    expect(lines[1].startsWith(" ")).toBe(true)
  })

  it("should generate valid RFC 5545 METHOD:REQUEST iCalendar payload for new bookings", () => {
    const ics = generateIcsContent({
      uid: "test-booking-123",
      sequence: 0,
      method: "REQUEST",
      status: "CONFIRMED",
      startTime: sampleStart,
      endTime: sampleEnd,
      summary: "Full Stack Architecture with Fi Amanillah",
      description: "Consultation discussion on scaling.",
      location: "https://meet.google.com/abc-defg-hij",
      organizerName: "Fi Amanillah",
      organizerEmail: "fi@amanillah.com",
      attendeeName: "John Doe",
      attendeeEmail: "john@example.com",
    })

    expect(ics).toContain("BEGIN:VCALENDAR")
    expect(ics).toContain("VERSION:2.0")
    expect(ics).toContain("METHOD:REQUEST")
    expect(ics).toContain("BEGIN:VEVENT")
    expect(ics).toContain("UID:test-booking-123@fi.amanillah.com")
    expect(ics).toContain("STATUS:CONFIRMED")
    expect(ics).toContain("SEQUENCE:0")
    expect(ics).toContain("DTSTART:20260825T140000Z")
    expect(ics).toContain("DTEND:20260825T143000Z")
    expect(ics).toContain("SUMMARY:Full Stack Architecture with Fi Amanillah")
    expect(ics).toContain("ORGANIZER;CN=Fi Amanillah:mailto:fi@amanillah.com")
    expect(ics).toContain("ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION")
    expect(ics).toContain("CN=John Doe:mailto:john@example.com")
    expect(ics).toContain("LOCATION:https://meet.google.com/abc-defg-hij")
    expect(ics).toContain("X-GOOGLE-CONFERENCE:https://meet.google.com/abc-defg-hij")
    expect(ics).toContain("END:VEVENT")
    expect(ics).toContain("END:VCALENDAR")
  })

  it("should generate valid RFC 5545 METHOD:CANCEL iCalendar payload for cancellations", () => {
    const ics = generateIcsContent({
      uid: "test-booking-123",
      sequence: 1,
      method: "CANCEL",
      status: "CANCELLED",
      startTime: sampleStart,
      endTime: sampleEnd,
      summary: "CANCELLED: Full Stack Architecture with Fi Amanillah",
      description: "Session was cancelled by attendee.",
      organizerName: "Fi Amanillah",
      organizerEmail: "fi@amanillah.com",
      attendeeName: "John Doe",
      attendeeEmail: "john@example.com",
    })

    expect(ics).toContain("METHOD:CANCEL")
    expect(ics).toContain("STATUS:CANCELLED")
    expect(ics).toContain("SEQUENCE:1")
    expect(ics).toContain("TRANSP:TRANSPARENT")
    expect(ics).toContain("PARTSTAT=DECLINED")
  })

  it("should generate valid calendar deep links for 1-click additions", () => {
    const links = generateCalendarDeeplinks({
      title: "Architecture Consultation",
      startTime: sampleStart,
      endTime: sampleEnd,
      description: "Meeting details",
      location: "https://meet.google.com/abc-defg-hij",
    })

    expect(links.googleCalendarUrl).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE")
    expect(links.googleCalendarUrl).toContain("dates=20260825T140000Z/20260825T143000Z")
    expect(links.outlookLiveUrl).toContain("https://outlook.live.com/calendar/0/deeplink/compose")
    expect(links.outlookOfficeUrl).toContain("https://outlook.office.com/calendar/0/deeplink/compose")
  })

  it("should generate valid Schema.org EventReservation JSON-LD snippet", () => {
    const jsonLd = generateEventReservationJsonLd({
      bookingId: "test-booking-123",
      meetingType: "Architecture Review",
      startTime: sampleStart,
      endTime: sampleEnd,
      guestName: "Jane Smith",
      guestEmail: "jane@example.com",
      googleMeetLink: "https://meet.google.com/abc-defg-hij",
    })

    expect(jsonLd).toContain('<script type="application/ld+json">')
    expect(jsonLd).toContain('"@type": "EventReservation"')
    expect(jsonLd).toContain('"reservationNumber": "test-booking-123"')
    expect(jsonLd).toContain('"name": "Jane Smith"')
  })

  it("should render booking confirmation email with calendar links and schema markup", () => {
    const rendered = renderBookingConfirmationEmail({
      bookingId: "bk-123",
      guestName: "Alex Mercer",
      guestEmail: "alex@example.com",
      meetingType: "Full Stack Architecture",
      startTime: sampleStart,
      endTime: sampleEnd,
      durationMinutes: 30,
      timezone: "UTC",
      googleMeetLink: "https://meet.google.com/abc-defg-hij",
      cancellationToken: "token-uuid-123",
    })

    expect(rendered.html).toContain("1-CLICK CALENDAR SYNC")
    expect(rendered.html).toContain("calendar.google.com/calendar/render")
    expect(rendered.html).toContain("outlook.live.com/calendar")
    expect(rendered.html).toContain("/api/v1/booking/ics?token=token-uuid-123")
    expect(rendered.html).toContain('application/ld+json')
    expect(rendered.html).toContain('EventReservation')
  })
})
