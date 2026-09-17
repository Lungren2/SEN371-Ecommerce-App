import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Keep the repository path for GitHub Pages by default. Render's Docker build
// overrides VITE_BASE_PATH=/ so the same app is served from the domain root.
export default defineConfig({
    base: process.env.VITE_BASE_PATH || '/SEN371-Ecommerce-App/',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5188',
                changeOrigin: true,
            },
        },
    },
})
