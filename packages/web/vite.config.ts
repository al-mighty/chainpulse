import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/chainpulse/',
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/chainpulse': {
        target: 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/api\/chainpulse/, ''),
      },
    },
  },
});
