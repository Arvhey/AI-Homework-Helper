import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer'
            }
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase'
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts'
            }
            return 'vendor-libs'
          }
        }
      }
    }
  }
})
