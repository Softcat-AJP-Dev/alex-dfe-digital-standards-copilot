import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/alex/dfe-digital-standards-copilot/",
  build: {
    outDir: "dist",
  },
});
