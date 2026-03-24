import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset URLs keep the build working on both the custom domain
  // root and the GitHub Pages repo subpath.
  base: './',
})
