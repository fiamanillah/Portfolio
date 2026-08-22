// src/services/GoogleCalendarService.ts
import { google } from "googleapis"
import { prisma } from "@workspace/db"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"

export class GoogleCalendarService {
  private logger = new AppLogger("GoogleCalendarService")

  private getOAuthClient() {
    return new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    )
  }

  /**
   * Check if Google OAuth client ID and Secret are configured
   */
  public isConfigured(): boolean {
    return Boolean(config.google.clientId && config.google.clientSecret)
  }

  /**
   * Generate authorization URL for Admin to connect their Google Calendar
   */
  public getAuthUrl(state?: string): string {
    if (!this.isConfigured()) {
      throw new Error(
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
      )
    }

    const oauth2Client = this.getOAuthClient()
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state,
    })
  }

  /**
   * Exchange OAuth authorization code for tokens and save to DB
   */
  public async handleCallback(code: string, userId: string) {
    const oauth2Client = this.getOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token) {
      throw new Error("Failed to retrieve access token from Google OAuth")
    }

    oauth2Client.setCredentials(tokens)

    // Retrieve user email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    const expiryDate = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000)

    const saved = await prisma.googleCalendarAccount.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: expiryDate,
        email: userInfo.email || "primary",
        isActive: true,
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        tokenExpiry: expiryDate,
        email: userInfo.email || "primary",
        isActive: true,
      },
    })

    this.logger.info(`✔ Google Calendar connected for account: ${saved.email}`)
    return saved
  }

  /**
   * Disconnect the Google Calendar account
   */
  public async disconnect(userId?: string) {
    if (userId) {
      await prisma.googleCalendarAccount.deleteMany({
        where: { userId },
      })
    } else {
      await prisma.googleCalendarAccount.deleteMany({})
    }
    this.logger.info("✔ Google Calendar disconnected")
  }

  /**
   * Get active connection status
   */
  public async getStatus() {
    const account = await prisma.googleCalendarAccount.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        calendarId: true,
        updatedAt: true,
        isActive: true,
      },
    })

    return {
      connected: Boolean(account),
      email: account?.email || null,
      calendarId: account?.calendarId || null,
      updatedAt: account?.updatedAt || null,
      isConfigured: this.isConfigured(),
    }
  }

  /**
   * Get authenticated Google Calendar client with auto-refreshing token handling
   */
  private async getCalendarClient() {
    const account = await prisma.googleCalendarAccount.findFirst({
      where: { isActive: true },
    })

    if (!account || !account.refreshToken) {
      return null
    }

    const oauth2Client = this.getOAuthClient()
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
      expiry_date: account.tokenExpiry.getTime(),
    })

    // Listen for refreshed token events and update in database
    oauth2Client.on("tokens", async (newTokens) => {
      try {
        await prisma.googleCalendarAccount.update({
          where: { id: account.id },
          data: {
            accessToken: newTokens.access_token || account.accessToken,
            refreshToken: newTokens.refresh_token || account.refreshToken,
            tokenExpiry: newTokens.expiry_date
              ? new Date(newTokens.expiry_date)
              : account.tokenExpiry,
          },
        })
        this.logger.debug("Google OAuth tokens refreshed and updated in DB")
      } catch (err) {
        this.logger.error("Failed to update refreshed Google OAuth tokens in DB", { error: err })
      }
    })

    return google.calendar({ version: "v3", auth: oauth2Client })
  }

  /**
   * Fetch busy time intervals from Google Calendar
   */
  public async getBusyIntervals(
    timeMin: Date,
    timeMax: Date
  ): Promise<{ start: Date; end: Date }[]> {
    try {
      const calendar = await this.getCalendarClient()
      if (!calendar) {
        return []
      }

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: "primary" }],
        },
      })

      const busyList = response.data.calendars?.["primary"]?.busy || []
      return busyList
        .filter((item) => item.start && item.end)
        .map((item) => ({
          start: new Date(item.start!),
          end: new Date(item.end!),
        }))
    } catch (error) {
      this.logger.error("Failed to query Google Calendar free/busy intervals:", {
        error: error instanceof Error ? error.message : error,
      })
      return []
    }
  }

  /**
   * Create an event with Google Meet on Google Calendar
   */
  public async createCalendarEvent(params: {
    guestName: string
    guestEmail: string
    startTime: Date
    endTime: Date
    notes?: string | null
    meetingType: string
  }): Promise<{ googleEventId?: string; googleMeetLink?: string } | null> {
    try {
      const calendar = await this.getCalendarClient()
      if (!calendar) {
        this.logger.warn("No active Google Calendar connected. Skipping GCal event creation.")
        return null
      }

      const requestId = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const event = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        sendUpdates: "none",
        requestBody: {
          summary: `${params.meetingType} with ${params.guestName}`,
          description: `Meeting details:\n• Guest: ${params.guestName} (${params.guestEmail})\n• Type: ${params.meetingType}\n• Notes: ${params.notes || "None"}`,
          start: {
            dateTime: params.startTime.toISOString(),
          },
          end: {
            dateTime: params.endTime.toISOString(),
          },
          attendees: [
            {
              email: params.guestEmail,
              displayName: params.guestName,
            },
          ],
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      })

      const meetLink =
        event.data.hangoutLink ||
        event.data.conferenceData?.entryPoints?.find(
          (ep) => ep.entryPointType === "video"
        )?.uri ||
        null

      return {
        googleEventId: event.data.id || undefined,
        googleMeetLink: meetLink || undefined,
      }
    } catch (error) {
      this.logger.error("Failed to create Google Calendar event:", {
        error: error instanceof Error ? error.message : error,
      })
      return null
    }
  }

  /**
   * Delete an event from Google Calendar upon cancellation
   */
  public async deleteCalendarEvent(googleEventId: string): Promise<boolean> {
    try {
      const calendar = await this.getCalendarClient()
      if (!calendar) return false

      await calendar.events.delete({
        calendarId: "primary",
        eventId: googleEventId,
        sendUpdates: "none",
      })

      this.logger.info(`✔ Google Calendar event ${googleEventId} deleted`)
      return true
    } catch (error) {
      this.logger.error("Failed to delete Google Calendar event:", {
        error: error instanceof Error ? error.message : error,
      })
      return false
    }
  }
}
