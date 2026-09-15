import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages project site: https://salilmalkan.github.io/streetball/
  base: process.env.GH_PAGES === '1' ? '/streetball/' : '/',
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
})
