// ── Booking System: Shared Types & Constants ──────────────────────────────────

export const POPULAR_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Dhaka",
  "Australia/Sydney",
] as const

export interface TopicOption {
  id: string
  title: string
  desc: string
  badge: string
}

export const TOPIC_OPTIONS: TopicOption[] = [
  {
    id: "Full Stack Architecture & Cloud Scaling",
    title: "Full Stack Architecture & Cloud",
    desc: "System design, microservices, scaling & cloud infrastructure review.",
    badge: "Architecture",
  },
  {
    id: "Frontend Engineering & Design Systems",
    title: "Frontend & Design Systems",
    desc: "Modern UI/UX engineering, Astro/React optimization & component architecture.",
    badge: "Frontend",
  },
  {
    id: "Distributed Systems & Microservices",
    title: "Distributed Systems & Event-Driven",
    desc: "Event sourcing, Kafka/RabbitMQ, CQRS, and zero-downtime database strategies.",
    badge: "Backend",
  },
  {
    id: "Technical Advisory & Architecture Review",
    title: "Technical Advisory & Mentorship",
    desc: "Engineering leadership advisory, code reviews, and tech stack consultation.",
    badge: "Advisory",
  },
  {
    id: "New Project Collaboration & Scoping",
    title: "Project Scoping & Collaboration",
    desc: "Scoping requirements, MVP planning, and technical roadmapping.",
    badge: "Collab",
  },
]

export const COMMON_EMAIL_TYPOS: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.co": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "iclud.com": "icloud.com",
  "protonmaill.com": "protonmail.com",
}

/** Detect email domain typos and return a corrected suggestion or null */
export function detectEmailTypo(email: string): string | null {
  const clean = email.trim().toLowerCase()
  const atIndex = clean.lastIndexOf("@")
  if (atIndex > 0) {
    const domain = clean.slice(atIndex + 1)
    if (COMMON_EMAIL_TYPOS[domain]) {
      return `${clean.slice(0, atIndex)}@${COMMON_EMAIL_TYPOS[domain]}`
    }
  }
  return null
}

/** Generate a Google Calendar event URL from a confirmed booking */
export function generateGoogleCalendarUrl(booking: {
  startTime: string | Date
  endTime: string | Date
  meetingType: string
  googleMeetLink?: string | null
  guestNotes?: string | null
}): string {
  const startIso = new Date(booking.startTime).toISOString().replace(/-|:|\.\d+/g, "")
  const endIso = new Date(booking.endTime).toISOString().replace(/-|:|\.\d+/g, "")
  const title = encodeURIComponent(`${booking.meetingType} with Fi Amanillah`)
  const details = encodeURIComponent(
    `1-on-1 Consultation Session.\n\nGoogle Meet: ${booking.googleMeetLink || "Generated automatically"}\nNotes: ${booking.guestNotes || "None"}`
  )
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`
}

/** Download a calendar .ics file for Apple/Outlook */
export function downloadIcsFile(booking: {
  id: string
  startTime: string | Date
  endTime: string | Date
  meetingType: string
  googleMeetLink?: string | null
  guestNotes?: string | null
}): void {
  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "")
  const start = fmt(new Date(booking.startTime))
  const end = fmt(new Date(booking.endTime))

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fi Amanillah//Booking Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${booking.id}@fi.amanillah.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${booking.meetingType} with Fi Amanillah`,
    `DESCRIPTION:Meeting with Fi Amanillah.\\nGoogle Meet: ${booking.googleMeetLink || "Online Room"}\\nNotes: ${booking.guestNotes || "None"}`,
    `LOCATION:${booking.googleMeetLink || "Google Meet Video Call"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `consultation-fi-amanillah.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
