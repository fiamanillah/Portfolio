// ── Booking System: Shared Types & Constants ──────────────────────────────────

export interface TimezoneItem {
  value: string
  label: string
}

export interface TimezoneRegion {
  region: string
  timezones: TimezoneItem[]
}

export const TIMEZONE_REGIONS: TimezoneRegion[] = [
  {
    region: "Universal / UTC",
    timezones: [
      { value: "UTC", label: "UTC (Coordinated Universal Time)" },
      { value: "GMT", label: "GMT (Greenwich Mean Time)" },
    ],
  },
  {
    region: "Americas",
    timezones: [
      { value: "America/New_York", label: "New York (EST/EDT, UTC-5/-4)" },
      { value: "America/Chicago", label: "Chicago (CST/CDT, UTC-6/-5)" },
      { value: "America/Denver", label: "Denver (MST/MDT, UTC-7/-6)" },
      { value: "America/Los_Angeles", label: "Los Angeles / SF (PST/PDT, UTC-8/-7)" },
      { value: "America/Anchorage", label: "Anchorage (AKST/AKDT, UTC-9/-8)" },
      { value: "America/Toronto", label: "Toronto (EST/EDT, UTC-5/-4)" },
      { value: "America/Vancouver", label: "Vancouver (PST/PDT, UTC-8/-7)" },
      { value: "America/Mexico_City", label: "Mexico City (CST, UTC-6)" },
      { value: "America/Bogota", label: "Bogota / Lima (COT/PET, UTC-5)" },
      { value: "America/Sao_Paulo", label: "São Paulo (BRT, UTC-3)" },
      { value: "America/Buenos_Aires", label: "Buenos Aires (ART, UTC-3)" },
      { value: "America/Santiago", label: "Santiago (CLT, UTC-3/-4)" },
    ],
  },
  {
    region: "Europe",
    timezones: [
      { value: "Europe/London", label: "London / Dublin (GMT/BST, UTC+0/+1)" },
      { value: "Europe/Paris", label: "Paris / Brussels (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Berlin", label: "Berlin / Frankfurt (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Madrid", label: "Madrid / Barcelona (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Rome", label: "Rome / Milan (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Stockholm", label: "Stockholm / Oslo (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Zurich", label: "Zurich / Geneva (CET/CEST, UTC+1/+2)" },
      { value: "Europe/Athens", label: "Athens / Bucharest (EET/EEST, UTC+2/+3)" },
      { value: "Europe/Helsinki", label: "Helsinki / Tallinn (EET/EEST, UTC+2/+3)" },
      { value: "Europe/Kyiv", label: "Kyiv (EET/EEST, UTC+2/+3)" },
      { value: "Europe/Istanbul", label: "Istanbul (TRT, UTC+3)" },
      { value: "Europe/Moscow", label: "Moscow (MSK, UTC+3)" },
    ],
  },
  {
    region: "Asia & Middle East",
    timezones: [
      { value: "Asia/Dubai", label: "Dubai / Abu Dhabi (GST, UTC+4)" },
      { value: "Asia/Riyadh", label: "Riyadh / Doha (AST, UTC+3)" },
      { value: "Asia/Karachi", label: "Karachi / Islamabad (PKT, UTC+5)" },
      { value: "Asia/Kolkata", label: "Kolkata / Mumbai / Delhi (IST, UTC+5:30)" },
      { value: "Asia/Dhaka", label: "Dhaka (BST, UTC+6)" },
      { value: "Asia/Bangkok", label: "Bangkok / Hanoi / Jakarta (ICT/WIB, UTC+7)" },
      { value: "Asia/Singapore", label: "Singapore / KL (SGT/MYT, UTC+8)" },
      { value: "Asia/Hong_Kong", label: "Hong Kong (HKT, UTC+8)" },
      { value: "Asia/Shanghai", label: "Shanghai / Beijing (CST, UTC+8)" },
      { value: "Asia/Taipei", label: "Taipei (CST, UTC+8)" },
      { value: "Asia/Tokyo", label: "Tokyo / Osaka (JST, UTC+9)" },
      { value: "Asia/Seoul", label: "Seoul (KST, UTC+9)" },
    ],
  },
  {
    region: "Africa",
    timezones: [
      { value: "Africa/Cairo", label: "Cairo (EEST, UTC+3)" },
      { value: "Africa/Johannesburg", label: "Johannesburg / Cape Town (SAST, UTC+2)" },
      { value: "Africa/Lagos", label: "Lagos / Accra (WAT/GMT, UTC+1/+0)" },
      { value: "Africa/Nairobi", label: "Nairobi / Addis Ababa (EAT, UTC+3)" },
      { value: "Africa/Casablanca", label: "Casablanca (WEST, UTC+1)" },
    ],
  },
  {
    region: "Australia & Pacific",
    timezones: [
      { value: "Australia/Perth", label: "Perth (AWST, UTC+8)" },
      { value: "Australia/Adelaide", label: "Adelaide (ACST/ACDT, UTC+9:30/+10:30)" },
      { value: "Australia/Sydney", label: "Sydney / Melbourne (AEST/AEDT, UTC+10/+11)" },
      { value: "Australia/Brisbane", label: "Brisbane (AEST, UTC+10)" },
      { value: "Pacific/Auckland", label: "Auckland / Wellington (NZST/NZDT, UTC+12/+13)" },
      { value: "Pacific/Honolulu", label: "Honolulu / Hawaii (HST, UTC-10)" },
      { value: "Pacific/Fiji", label: "Fiji (FJT, UTC+12)" },
    ],
  },
]

export const POPULAR_TIMEZONES = TIMEZONE_REGIONS.flatMap((r) => r.timezones.map((t) => t.value))

export const MAX_TOPIC_LENGTH = 100
export const MAX_NOTES_LENGTH = 1000
export const OTHER_TOPIC_VALUE = "OTHER"

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
    id: "Distributed Systems & Event-Driven Architecture",
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
    id: "New Project Collaboration & MVP Scoping",
    title: "Project Scoping & Collaboration",
    desc: "Scoping requirements, MVP planning, and technical roadmapping.",
    badge: "Collab",
  },
  {
    id: OTHER_TOPIC_VALUE,
    title: "Other / Custom Consultation Topic",
    desc: "Specify a custom agenda topic tailored to your specific project needs.",
    badge: "Custom",
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
