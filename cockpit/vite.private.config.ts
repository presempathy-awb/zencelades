import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(import.meta.dirname, "private"),
  publicDir: false,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve(import.meta.dirname, "private-dist"),
    emptyOutDir: true,
    assetsDir: "private-assets",
  },
});
