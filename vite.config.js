import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/elokuva-vahti-woh1/',
  plugins: [react(), tailwindcss()],
})
