import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import icon from "astro-icon"
import { webEnv } from "@workspace/env/web"

const siteUrl = webEnv.PUBLIC_WEB_URL.replace(/\/$/, "")

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
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime"],
    },
    ssr: {
      noExternal: ["@workspace/ui", "@workspace/shared", "@workspace/env"],
    },
  },
  integrations: [react(), icon()],
})

