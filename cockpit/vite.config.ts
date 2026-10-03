import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "reject-private-prompt-imports",
      moduleParsed(module) {
        if (/\/src\/AudioView\.tsx(?:\?|$)|\/docs\/audio\//.test(module.id))
          this.error("Private AudioView or docs/audio module imported into public bundle");
      },
    },
  ],
  build: { assetsDir: "studio-assets" },
  server: { host: "127.0.0.1" },
});
