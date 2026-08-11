import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Party2Go",
        short_name: "P2Go",
        description: "Junte-se à maior rede de alegria infantil",
        theme_color: "#fd5e3a",
        background_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "../shared"),
      "@backend": resolve(__dirname, "../backend"),
      "firebase":         resolve(__dirname, "./node_modules/firebase"),
      "mapbox-gl":        resolve(__dirname, "./node_modules/mapbox-gl"),
      "socket.io-client": resolve(__dirname, "./node_modules/socket.io-client"),
    },
    dedupe: ["firebase", "vue", "mapbox-gl", "socket.io-client"],
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
