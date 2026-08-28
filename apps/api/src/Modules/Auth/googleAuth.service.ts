// src/Modules/Auth/googleAuth.service.ts
import { google } from "googleapis"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"
import { AuthenticationError, BadRequestError } from "@/core/errors/AppError"

export interface GoogleUserProfile {
  googleId: string
  email: string
  name: string
  picture?: string | null
  emailVerified?: boolean
}

export class GoogleAuthService {
  private logger = new AppLogger("GoogleAuthService")

  private getOAuthClient(redirectUri?: string) {
    const callbackUrl =
      redirectUri ||
      config.google.authCallbackUrl ||
      `${config.site.webUrl}/auth/v1/google/callback`

    return new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      callbackUrl
    )
  }

  public isConfigured(): boolean {
    return Boolean(config.google.clientId && config.google.clientSecret)
  }

  /**
   * Generates Google OAuth consent URL
   */
  public getAuthUrl(state?: string, redirectUri?: string): string {
    if (!this.isConfigured()) {
      throw new BadRequestError(
        "Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
      )
    }

    const oauth2Client = this.getOAuthClient(redirectUri)
    return oauth2Client.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      state,
    })
  }

  /**
   * Exchanges authorization code for Google profile
   */
  public async verifyCode(
    code: string,
    redirectUri?: string
  ): Promise<GoogleUserProfile> {
    if (!this.isConfigured()) {
      throw new BadRequestError("Google OAuth is not configured.")
    }

    try {
      const oauth2Client = this.getOAuthClient(redirectUri)
      const { tokens } = await oauth2Client.getToken(code)

      if (!tokens.access_token && !tokens.id_token) {
        throw new AuthenticationError("Failed to obtain tokens from Google.")
      }

      oauth2Client.setCredentials(tokens)
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
      const { data: userInfo } = await oauth2.userinfo.get()

      if (!userInfo.email) {
        throw new AuthenticationError(
          "Google profile did not contain an email address."
        )
      }

      let picture = userInfo.picture || null
      if (picture && picture.includes("=s96-c")) {
        picture = picture.replace("=s96-c", "=s384-c")
      }

      return {
        googleId: userInfo.id || userInfo.email,
        email: userInfo.email.toLowerCase().trim(),
        name: userInfo.name || userInfo.email.split("@")[0],
        picture,
        emailVerified: Boolean(userInfo.verified_email ?? true),
      }
    } catch (err: unknown) {
      this.logger.error("Failed to verify Google OAuth code:", {
        error: err instanceof Error ? err.message : String(err),
      })
      throw new AuthenticationError(
        err instanceof Error
          ? err.message
          : "Failed to authenticate with Google."
      )
    }
  }

  /**
   * Verifies Google ID Token (e.g. from Google One-Tap / GIS)
   */
  public async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    if (!this.isConfigured()) {
      throw new BadRequestError("Google OAuth is not configured.")
    }

    try {
      const oauth2Client = this.getOAuthClient()
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      })

      const payload = ticket.getPayload()
      if (!payload || !payload.email) {
        throw new AuthenticationError("Invalid Google ID token payload.")
      }

      let picture = payload.picture || null
      if (picture && picture.includes("=s96-c")) {
        picture = picture.replace("=s96-c", "=s384-c")
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase().trim(),
        name: payload.name || payload.email.split("@")[0],
        picture,
        emailVerified: Boolean(payload.email_verified ?? true),
      }
    } catch (err: unknown) {
      this.logger.error("Failed to verify Google ID token:", {
        error: err instanceof Error ? err.message : String(err),
      })
      throw new AuthenticationError(
        err instanceof Error ? err.message : "Invalid Google credential token."
      )
    }
  }
}
