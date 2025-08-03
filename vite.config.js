import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004
  },
  resolve: {
    alias: {
      // Add any aliases you need
    }
  },
  define: {
    global: 'window',
  },
  optimizeDeps: {
    include: ['sockjs-client']
  }
});
