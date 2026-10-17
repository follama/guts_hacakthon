import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, /api/* is forwarded to the FastAPI server.
    // 127.0.0.1 rather than localhost: on Windows, Node resolves localhost to
    // ::1 first, which uvicorn is not listening on.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
