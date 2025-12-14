import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
// import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    // viteStaticCopy({ targets: [{ src: "apps-script/*", dest: "./" }] }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: "../dist",
    emptyOutDir: false
  },
  server: {
    host: "127.0.0.1", // IPv4に固定（localhostの解決揺れを排除）
    port: 5173,
    strictPort: true, // ポート自動変更を抑止（診断容易）
    hmr: {
      host: "127.0.0.1", // HMRのWS接続先もIPv4に固定
      port: 5173,
    },
  },
});
