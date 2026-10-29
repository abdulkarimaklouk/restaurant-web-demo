
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Base path for the GitHub Pages repository site
  base: '/restaurant-web-demo/',

  server: {
    port: 5173,
    host: true,
  },
});
