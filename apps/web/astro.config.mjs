import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import icon from "astro-icon"
import { webEnv } from "@workspace/env/web"

const isProd = process.env.NODE_ENV === "production"
const siteUrl = (
  process.env.PUBLIC_WEB_URL ||
  (isProd ? "https://fi.amanillah.com" : webEnv.PUBLIC_WEB_URL)
).replace(/\/$/, "")

export default defineConfig({
  site: siteUrl,
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  build: {
    inlineStylesheets: "auto",
  },
  redirects: {
    "/terms-of-use": {
      status: 301,
      destination: "/terms",
    },
  },
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
    build: {
      cssMinify: true,
      minify: "esbuild",
    },
    ssr: {
      noExternal: ["@workspace/ui", "@workspace/shared", "@workspace/env"],
    },
  },
  integrations: [react(), icon()],
})

