// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import icon from "astro-icon"

// https://astro.build/config
export default defineConfig({
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
