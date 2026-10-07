import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  // Listen on every interface: by default vite binds only the IPv6
  // localhost on Windows, so requests that resolve `localhost` to
  // 127.0.0.1 (IPv4) — e.g. some Chrome loads — get ECONNREFUSED.
  server: {
    host: true,
  }
})
