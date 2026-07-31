import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "demo",
  build: {
    outDir: resolve(__dirname, "dist-demo"),
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "demo", "index.html"),
        basic: resolve(__dirname, "demo", "basic", "index.html"),
      },
    },
  },
});
