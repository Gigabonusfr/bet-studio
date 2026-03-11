import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Build statique du front Stake Engine (player React) vers public/stake-react-front/.
 * Important: base './' pour fonctionner depuis un sous-dossier (CDN Stake Engine).
 */
export default defineConfig({
  root: path.resolve(__dirname, "stake-front"),
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "public", "stake-react-front"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, "stake-front", "index.html"),
    },
  },
});

