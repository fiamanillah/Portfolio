import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import icon from "astro-icon"

const siteUrl = (process.env.PUBLIC_WEB_URL || "https://fi.amanillah.com").replace(/\/$/, "")

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "tokyo-night",
      },
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), icon()],
})

