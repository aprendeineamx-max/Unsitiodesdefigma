import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Listen on all addresses
        port: 5175 // Use 5175 to allow v19(5173) and v21(5174)
    }
})
