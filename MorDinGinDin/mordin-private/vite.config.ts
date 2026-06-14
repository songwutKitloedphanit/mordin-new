import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: 'private', // กำหนด base path สำหรับการ build
  server: {
    host: '0.0.0.0', // ใช้ host ที่ให้เข้าถึงได้จากภายนอก
    port: 5173, // กำหนดพอร์ต
    strictPort: true, // ห้ามใช้พอร์ตอื่น
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:3000', // ตั้ง proxy สำหรับ API
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      buffer: 'buffer/',
    },
  },
});
