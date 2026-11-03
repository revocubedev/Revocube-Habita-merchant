import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: "192.168.2.94",
    open: true,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://excitable-cradle-headboard.ngrok-free.dev",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader("ngrok-skip-browser-warning", "true");
          });
        },
      },
    },
  },
});
