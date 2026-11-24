// frontend/vite.config.js
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isPort5174 = process.argv.some(arg => arg.includes('5174')) || mode === 'admin';

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    server: {
      allowedHosts: true, // Cho phép truy cập qua domain ngẫu nhiên khi dùng Cloudflare Tunnel
    },
    define: {
      'import.meta.env.VITE_PORTAL': JSON.stringify(isPort5174 ? 'admin' : ''),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});