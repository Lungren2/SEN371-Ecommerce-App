import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    base: '/SEN371-Ecommerce-App/',
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