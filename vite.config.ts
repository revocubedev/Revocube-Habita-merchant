import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = (env.VITE_API_BASE_URL || env.VITE_BASE_URL || '').replace(/\/+$/, '');
  const isNgrok = /^https?:\/\/[^/]+\.ngrok-free\.(app|dev)$/i.test(apiTarget);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true,
      open: true,
      strictPort: true,
      proxy: apiTarget ? {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          ...(isNgrok ? {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          } : {}),
        },
      } : undefined,
    },
  };
});
