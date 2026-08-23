// src/services/PlunkVerifyService.ts
import axios from "axios"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"
import { BadRequestError } from "@/core/errors/AppError"

export interface PlunkVerifyResult {
  email: string
  valid: boolean
  isDisposable: boolean
  isAlias: boolean
  isTypo: boolean
  isPlusAddressed: boolean
  isPersonalEmail: boolean
  domainExists: boolean
  hasWebsite: boolean
  hasMxRecords: boolean
  reasons: string[]
  suggestedEmail?: string
}

export class PlunkVerifyService {
  private static logger = new AppLogger("PlunkVerifyService")

  /**
   * Helper to check if an API secret key is missing or is a placeholder key
   */
  public static isPlaceholderKey(key?: string): boolean {
    if (!key) return true
    const trimmed = key.trim().toLowerCase()
    return (
      trimmed === "" ||
      trimmed.includes("your_key") ||
      trimmed.includes("your_secret") ||
      trimmed.includes("yourturnstile") ||
      trimmed.includes("placeholder") ||
      trimmed.includes("change-me") ||
      trimmed.startsWith("plunk_sk_your") ||
      trimmed.startsWith("1x0000") ||
      trimmed.startsWith("2x0000") ||
      trimmed.startsWith("3x0000")
    )
  }

  /**
   * Verifies email hygiene via Plunk POST /v1/verify API with strict zero tolerance for fake/disposable emails.
   */
  public static async verifyEmail(
    email: string
  ): Promise<PlunkVerifyResult | null> {
    const cleanEmail = email.trim().toLowerCase()
    const secretKey = config.plunk.secretKey

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.warn(
        "⚠️ PLUNK_SECRET_KEY missing or placeholder. Skipping Plunk POST /v1/verify in dev mode."
      )
      return null
    }

    try {
      const response = await axios.post(
        `${config.plunk.apiUrl}/v1/verify`,
        { email: cleanEmail },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 7000,
        }
      )

      const resData = response.data
      if (!resData || !resData.success || !resData.data) {
        this.logger.warn(
          `Plunk verify returned unexpected structure for ${cleanEmail}`,
          { resData }
        )
        return null
      }

      const data: PlunkVerifyResult = resData.data

      // ── 1. Strict Disposable Check ─────────────────────────────────────
      if (data.isDisposable) {
        this.logger.warn(`Rejected disposable email submission: ${cleanEmail}`)
        throw new BadRequestError(
          "Disposable or temporary email addresses are strictly prohibited. Please use your primary email address.",
          {
            isDisposable: true,
            reasons: data.reasons,
          }
        )
      }

      // ── 2. Strict Validity & MX Records Check ──────────────────────────
      if (
        data.valid === false ||
        data.hasMxRecords === false ||
        data.domainExists === false ||
        data.isTypo
      ) {
        const domain = cleanEmail.split("@")[1] || cleanEmail

        if (data.isTypo && data.suggestedEmail) {
          this.logger.warn(
            `Typo detected in email address: ${cleanEmail} -> Suggested: ${data.suggestedEmail}`
          )
          throw new BadRequestError(
            `Possible typo detected in email address. Did you mean "${data.suggestedEmail}"?`,
            {
              isTypo: true,
              suggestedEmail: data.suggestedEmail,
              reasons: data.reasons,
            }
          )
        }

        if (data.hasMxRecords === false) {
          this.logger.warn(`Email domain has no MX records: ${cleanEmail}`)
          throw new BadRequestError(
            `Invalid email domain: "${domain}" cannot receive email (no MX records found).`,
            {
              hasMxRecords: false,
              reasons: data.reasons,
            }
          )
        }

        if (data.domainExists === false) {
          this.logger.warn(`Email domain does not exist: ${cleanEmail}`)
          throw new BadRequestError(
            `Invalid email address: The domain "${domain}" does not exist.`,
            {
              domainExists: false,
              reasons: data.reasons,
            }
          )
        }

        const reasonMsg =
          data.reasons && data.reasons.length > 0
            ? data.reasons.join(". ")
            : "The email address provided is invalid and cannot receive messages."

        this.logger.warn(
          `Email verification failed for ${cleanEmail}: ${reasonMsg}`
        )
        throw new BadRequestError(`Invalid email address: ${reasonMsg}`, {
          reasons: data.reasons,
          suggestedEmail: data.suggestedEmail,
        })
      }

      this.logger.info(`✔ Plunk email verification passed for ${cleanEmail}`)
      return data
    } catch (error) {
      if (error instanceof BadRequestError) throw error

      if (axios.isAxiosError(error) && error.response) {
        const resData = error.response.data
        if (
          resData?.data?.isDisposable ||
          resData?.message?.includes("disposable")
        ) {
          throw new BadRequestError(
            "Disposable or temporary email addresses are strictly prohibited. Please use your primary email address.",
            { isDisposable: true }
          )
        }
      }

      this.logger.warn(
        "Plunk verify check encountered network/service issue, allowing formatted email",
        { error }
      )
      return null
    }
  }
}
