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
