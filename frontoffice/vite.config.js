import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
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
    port: 5175,
    strictPort: false,
  },
});
