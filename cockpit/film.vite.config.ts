import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/film/" : "/",
  publicDir: "../source/research/enceladus-cinema/web",
  plugins: [
    {
      name: "showtime-route",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const [path, query] = (request.url ?? "").split("?");
          if (path === "/showtime" || path === "/showtime/")
            request.url = `/showtime/index.html${query ? `?${query}` : ""}`;
          next();
        });
      },
    },
  ],
  build: {
    outDir: "dist/film",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        film: resolve(import.meta.dirname, "enceladus-film.html"),
        showtime: resolve(import.meta.dirname, "showtime/index.html"),
      },
    },
  },
  server: { host: "127.0.0.1" },
}));
