// vite.config.js
import { defineConfig } from "file:///C:/Users/filip/Documents/GitHub/H103/pwa/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/filip/Documents/GitHub/H103/pwa/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/filip/Documents/GitHub/H103/pwa/node_modules/vite-plugin-pwa/dist/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\filip\\Documents\\GitHub\\H103\\pwa";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Party2Go",
        short_name: "P2Go",
        description: "Junte-se \xE0 maior rede de alegria infantil",
        theme_color: "#fd5e3a",
        background_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src"),
      "@shared": resolve(__vite_injected_original_dirname, "../shared"),
      "@backend": resolve(__vite_injected_original_dirname, "../backend"),
      "firebase": resolve(__vite_injected_original_dirname, "./node_modules/firebase"),
      "mapbox-gl": resolve(__vite_injected_original_dirname, "./node_modules/mapbox-gl"),
      "socket.io-client": resolve(__vite_injected_original_dirname, "./node_modules/socket.io-client")
    },
    dedupe: ["firebase", "vue", "mapbox-gl", "socket.io-client"]
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmaWxpcFxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXEgxMDNcXFxccHdhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmaWxpcFxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXEgxMDNcXFxccHdhXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9maWxpcC9Eb2N1bWVudHMvR2l0SHViL0gxMDMvcHdhL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxyXG4gICAgICBkZXZPcHRpb25zOiB7XHJcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiBcIlBhcnR5MkdvXCIsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogXCJQMkdvXCIsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSnVudGUtc2UgXHUwMEUwIG1haW9yIHJlZGUgZGUgYWxlZ3JpYSBpbmZhbnRpbFwiLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiNmZDVlM2FcIixcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiNmZmZmZmZcIixcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiL2ljb24tMTkyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiL2ljb24tNTEyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgXCJAc2hhcmVkXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcIi4uL3NoYXJlZFwiKSxcclxuICAgICAgXCJAYmFja2VuZFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9iYWNrZW5kXCIpLFxyXG4gICAgICBcImZpcmViYXNlXCI6ICAgICAgICAgcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9ub2RlX21vZHVsZXMvZmlyZWJhc2VcIiksXHJcbiAgICAgIFwibWFwYm94LWdsXCI6ICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgXCIuL25vZGVfbW9kdWxlcy9tYXBib3gtZ2xcIiksXHJcbiAgICAgIFwic29ja2V0LmlvLWNsaWVudFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50XCIpLFxyXG4gICAgfSxcclxuICAgIGRlZHVwZTogW1wiZmlyZWJhc2VcIiwgXCJ2dWVcIiwgXCJtYXBib3gtZ2xcIiwgXCJzb2NrZXQuaW8tY2xpZW50XCJdLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1QsU0FBUyxvQkFBb0I7QUFDclYsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGVBQWU7QUFIeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQy9CLFdBQVcsUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDekMsWUFBWSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUMzQyxZQUFvQixRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLE1BQ2hFLGFBQW9CLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDakUsb0JBQW9CLFFBQVEsa0NBQVcsaUNBQWlDO0FBQUEsSUFDMUU7QUFBQSxJQUNBLFFBQVEsQ0FBQyxZQUFZLE9BQU8sYUFBYSxrQkFBa0I7QUFBQSxFQUM3RDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
