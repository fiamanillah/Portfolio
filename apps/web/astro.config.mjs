import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import icon from "astro-icon"
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_WEB_URL || "https://fiamanillah.com",
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
  integrations: [
    react(),
    icon(),
    sitemap({
      filter: (page) => {
        return (
          !page.includes("/test") &&
          !page.includes("/text") &&
          !page.includes("/404")
        )
      },
      serialize(item) {
        if (
          item.url === "https://fiamanillah.com/" ||
          item.url === "https://fiamanillah.com"
        ) {
          item.priority = 1.0
          item.changefreq = ChangeFreqEnum.DAILY
          item.lastmod = new Date().toISOString()
        } else if (item.url.includes("/blog")) {
          item.priority = 0.9
          item.changefreq = ChangeFreqEnum.WEEKLY
          item.lastmod = new Date().toISOString()
        } else if (item.url.includes("/case-study")) {
          item.priority = 0.85
          item.changefreq = ChangeFreqEnum.MONTHLY
          item.lastmod = new Date().toISOString()
        } else if (item.url.includes("/unsubscribe")) {
          item.priority = 0.1
          item.changefreq = ChangeFreqEnum.YEARLY
        } else {
          item.priority = 0.7
          item.changefreq = ChangeFreqEnum.MONTHLY
        }
        return item
      },
    }),
  ],
})

