/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WEB_URL?: string
  readonly PUBLIC_API_URL: string
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string
  readonly PUBLIC_GA_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface TurnstileInstance {
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string
      theme?: "light" | "dark" | "auto"
      size?: "normal" | "compact" | "invisible"
      callback?: (token: string) => void
      "error-callback"?: () => void
      "expired-callback"?: () => void
    }
  ) => string
  reset: (widgetId?: string | null) => void
  remove: (widgetId?: string | null) => void
  getResponse: (widgetId?: string | null) => string | undefined
}

interface Window {
  turnstile?: TurnstileInstance
  __mobileNavGlobalInit?: boolean
  __PUBLIC_API_URL__?: string
  openCookiePreferences?: () => void
}
