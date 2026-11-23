import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  // Anvil2 icons are SVGs imported as React components (see Anvil2 README).
  plugins: [react(), svgr({ include: "**/*.svg" })],
  // Relative base so the build can be hosted on GitHub Pages later.
  base: "./",
});
