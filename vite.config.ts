import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Büyük bağımlılıkları ayrı, önbelleklenebilir chunk'lara böl (daha iyi Core Web Vitals).
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
        },
      },
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },
})
