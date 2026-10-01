import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "../source/research/enceladus-cinema/web",
  build: {
    outDir: "dist/film",
    emptyOutDir: true,
    rollupOptions: { input: resolve(import.meta.dirname, "enceladus-film.html") },
  },
  server: { host: "127.0.0.1" },
});
